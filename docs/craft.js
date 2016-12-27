/*
 Setup and Global variables
 */
var cy;
var toolsMap;
var filesMap;
var optionControlsMap;
var outputIds;
var stagesMap;

document.addEventListener('DOMContentLoaded', function () {
    setup();
});

$('[data-toggle=confirmation]').confirmation({
    rootSelector: '[data-toggle=confirmation]',
    // other options
});

function setup() {
    window.graphData = {
        'name': 'New Flow',
        'tools': [],
        'stages': []
    };
    window.options = [];
    toolsMap = {};
    stagesMap = {};
    filesMap = {};
    optionControlsMap = {};
    outputIds = [];
    cy = getLayout([]);

    // cleaning lists
    $('#tool-list > li').slice(2).remove();
    $('#stage-list > li').slice(2).remove();
    $('#tool-options > li').slice(2).remove();
    $('#stage-tool > option').slice(1).remove();
    $('#control-flow-list > li').slice(2).remove();
    $('#control-flow-from > option').slice(1).remove();
    $('#control-flow-to > option').slice(2).remove();
    $('#input-list > li').slice(2).remove();
    $('#output-list > li').slice(2).remove();
    $('#stage-oc-list > li').slice(2).remove();

    // hide all divs
    var divs = ['tool', 'stage', 'control-flow'];
    for (var i in divs) {
        document.getElementById(divs[i]).style.display = 'none';
    }
}

/*
 Control Buttons - Main Actions
 */
$('#clear-button').click(clearDesign);
$('#reload-button').click(loadExampleFlow);
$('#show-tool-button').click({div_id: 'tool'}, showForms);
$('#show-stage-button').click({div_id: 'stage'}, showForms);
$('#show-control-flow-button').click({div_id: 'control-flow'}, showForms);

function showForms(event) {
    event.preventDefault();
    if (!document.getElementById(event.data.div_id).style.display ||
        document.getElementById(event.data.div_id).style.display == 'none') {
        document.getElementById(event.data.div_id).style.display = 'block';
    } else {
        document.getElementById(event.data.div_id).style.display = 'none';
    }
}

function loadExampleFlow() {
    setup();

    // load the example flow
    window.graphData = window.exampleGraphData;
    loadFlow();
    showMessage('Loaded example flow.', 'success');
};

function showMessage(msg, type) {
    $('#control-buttons').append('<div class="msg alert alert-' + type + ' alert-dismissable fade in">'
        + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' + msg + '</div>');
}


/*
 Tool actions and functions
 */
$('#tool-add-tool').click({div_id: 'tool-form'}, showForms);
$('#tool-add-option').click({div_id: 'tool-option'}, showForms);
$('#tool-option-form').submit(addToolOption);
$('#tool-add-form').submit(addTool);
$('#cancel-tool-button').click({div_id: 'tool-form'}, showForms);
$('#cancel-tool-option-button').click({div_id: 'tool-option'}, showForms);

// Add an option to the tool
function addToolOption() {
    var op_id = document.getElementById('tool-option-id').value;
    var op_desc = document.getElementById('tool-option-description').value;
    var op_purpose = document.getElementById('tool-option-purpose').value;
    var op_notes = document.getElementById('tool-option-notes').value;

    $('#tool-options').append('<li><a href="#">' + op_id + '</a></li>');
    window.options.push({
        'id': op_id,
        'description': op_desc,
        'purpose': op_purpose,
        'notes': op_notes
    });
    document.getElementById('tool-option').style.display = 'none';
    showMessage('Added <strong>' + op_id + '</strong> option.', 'success');
    return false;
}

// Add a tool to the flow
function addTool() {
    var tool_name = document.getElementById("tool-name").value;
    var tool_version = document.getElementById("tool-version").value;
    var tool_id = tool_name.toLowerCase().replace(/[\/ ]/g, '-') + '_' + tool_version.toLowerCase().replace(/[\/ ]/g, '-');
    var tool_desc = document.getElementById("tool-description").value;
    var tool_notes = document.getElementById("tool-notes").value;

    var tool_opts = [];
    $('#tool-options li').each(function (index, element) {
        if (index > 1) {
            var op_id = $(this).text();
            for (var i = 0, len = window.options.length; i < len; i++) {
                if (window.options[i]['id'] == op_id) {
                    tool_opts.push(window.options[i]);
                }
            }
        }
    });

    var tool = {
        'id': tool_id,
        'name': tool_name,
        'version': tool_version,
        'functionality': {
            'description': tool_desc,
            'notes': tool_notes
        },
        'options': tool_opts
    };

    window.graphData['tools'].push(tool);
    toolsMap[tool_id] = tool;

    $('#tool-list').append('<li><a href="#">' + tool_id + '</a></li>');
    $('#stage-tool').append('<option>' + tool_id + '</a></option>');
    document.getElementById('tool-form').style.display = 'none';
    showMessage('Added <strong>' + tool_name + '</strong> tool.', 'success');
    return false;
}

/*
 Stage actions and functions
 */
$('#stage-add-stage').click({div_id: 'stage-form'}, showForms);
$('#stage-add-form').submit(addStage);
$('#input-add').click({type: 'input'}, showData);
$('#output-add').click({type: 'output'}, showData);
$('#cancel-stage-button').click({div_id: 'stage-form'}, showForms);
$('#stage-data-form').submit(addFile);
$('#cancel-stage-data-button').click({div_id: 'stage-data'}, showForms);
$('#stage-add-option-control').click({div_id: 'option-control'}, showForms);
$('#stage-oc-form').submit(addOptionControl);

// Add stage function
function addStage() {
    var stage_name = document.getElementById('stage-name').value;
    var stage_id = stage_name.toLowerCase().replace(/[\/ ]/g, '-');
    var tool_id = document.getElementById('stage-tool').value;

    var input_files = [];
    var output_files = [];
    var oc_module = [];

    $('#input-list li').each(function (index, element) {
        if (index > 1) {
            var input = $(this).find('input');
            var data_id = input.attr('id');
            if (input.prop('checked')) {
                input_files.push(filesMap[data_id]);
            }
            input.prop('checked', false);
        }
    });

    $('#output-list li').each(function (index, element) {
        if (index > 1) {
            var output = $(this).find('input');
            var data_id = output.attr('id');
            if (output.prop('checked')) {
                if (!outputIds[data_id]) {
                    output_files.push(filesMap[data_id]);
                } else {
                    output_files.push({
                        'output-id': data_id,
                        'description': filesMap[data_id]['description']
                    });
                }
            }
            output.prop('checked', false);
        }
    });

    $('#stage-oc-list li').each(function (index, element) {
        if (index > 1) {
            var oc_id = $(this).text();
            oc_module.push(optionControlsMap[oc_id]);
        }
    });

    var stage = {
        'id': stage_id,
        'name': stage_name,
        'tool': {
            'tool-id': tool_id,
            'option-control-module': oc_module
        },
        'inputs': [
            {
                'files': input_files
            }
        ],
        'outputs': [
            {
                'files': output_files
            }
        ],
        'flow-control': []
    };

    window.graphData['stages'].push(stage);
    stagesMap[stage_id] = stage;
    loadFlow();

    $('#control-flow-from').append('<option value="' + stage_id + '">' + stage_name + '</option>');
    $('#control-flow-to').append('<option value="' + stage_id + '">' + stage_name + '</option>');
    $('#stage-list').append('<li><a href="#">' + stage_id + '</a></li>');

    document.getElementById('stage-form').style.display = 'none';
    showMessage('Added <strong>' + stage_name + '</strong> stage.', 'success');
    return false;
}

// Input/Output Data
function showData(event) {
    document.getElementById('stage-data-type').value = event.data.type;
    if (event.data.type == 'input') {
        $('#stage-data-title').text("Add/Edit Input Data");
        document.getElementById('stage-data-providedby').style.display = 'block';
        document.getElementById('output-report-div').style.display = 'none';
    } else {
        $('#stage-data-title').text("Add/Edit Output Data");
        document.getElementById('output-report-div').style.display = 'block';
        document.getElementById('stage-data-providedby').style.display = 'none';
    }
    document.getElementById('stage-data').style.display = 'block';
}

// Add input/output data
function addFile() {
    var type = document.getElementById('stage-data-type').value;
    var file_id = document.getElementById('stage-data-id').value;
    var file = {
        'id': file_id,
        'content': document.getElementById('stage-data-content').value,
        'format': document.getElementById('stage-data-format').value,
        'description': document.getElementById('stage-data-description').value,
        'notes': document.getElementById('stage-data-notes').value
    };

    if (type == 'input') {
        file['provided-by'] = document.getElementById('stage-data-providedby').value;
        $('#input-list').append('<li><a href="#" class="small"><input type="checkbox" id="' + file_id
            + '" checked/>&nbsp;' + file_id + '</a></li>');
        $('#output-list').append('<li><a href="#" class="small"><input type="checkbox" id="' + file_id
            + '"/>&nbsp;' + file_id + '</a></li>');
    } else {
        file['report'] = document.getElementById('stage-data-output-type').checked;
        outputIds.push(file_id);
        $('#input-list').append('<li><a href="#" class="small"><input type="checkbox" id="' + file_id
            + '"/>&nbsp;' + file_id + '</a></li>');
        $('#output-list').append('<li><a href="#" class="small"><input type="checkbox" id="' + file_id
            + '" checked/>&nbsp;' + file_id + '</a></li>');
    }

    filesMap[file_id] = file;
    document.getElementById('stage-data').style.display = 'none';
    showMessage('Added <strong>' + file['content'] + '</strong> file.', 'success');
    return false;
}

// Add Option-Control Module
function addOptionControl() {
    var oc_id = document.getElementById('stage-oc-id').value;
    var oc = {
        'id': oc_id,
        'description': document.getElementById('stage-oc-description').value,
        'purpose': document.getElementById('stage-oc-purpose').value,
        'notes': document.getElementById('stage-oc-notes').value
    };

    optionControlsMap[oc_id] = oc;
    $('#stage-oc-list').append('<li><a href="#" class="small">' + oc_id + '</a></li>');
    document.getElementById('option-control').style.display = 'none';
    showMessage('Added <strong>' + oc_id + '</strong> option.', 'success');
    return false;
}

/*
 Control-Flow actions and functions
 */
$('#control-flow-add').click({div_id: 'control-flow-form'}, showForms);
$('#control-flow-add-form').submit(addControlFlow);
$('#cancel-control-flow-button').click({div_id: 'control-flow-form'}, showForms);


// Add control-flow function
function addControlFlow() {
    var from = document.getElementById("control-flow-from").value;
    var to = document.getElementById("control-flow-to").value;
    var condition = document.getElementById("control-flow-condition").value;
    var description = document.getElementById("control-flow-description").value;
    var notes = document.getElementById("control-flow-notes").value;
    var flow_id = from + '_TO_' + to;

    var control_flow = {
        "id": flow_id,
        "condition": condition,
        "route-to": to,
        "description": description,
        "notes": notes
    };

    stagesMap[from]['flow-control'].push(control_flow);
    loadFlow();
    $('#control-flow-list').append('<li><a href="#">' + flow_id + '</a></li>');
    document.getElementById('control-flow-form').style.display = 'none';
    showMessage('Added <strong>' + flow_id + '</strong> control-flow.', 'success');
    return false;
}


/*
 Design Functions
 */
function clearDesign() {
    setup();
    window.flow = {};
    window.flow['name'] = window.graphData['name'];
    window.flow['elements'] = {};
    window.flow.elements['nodes'] = [];
    window.flow.elements['edges'] = [];

    cy = getLayout(window.flow.elements);
};

// Flow Params
function getLayout(elements) {
    return window.cy = cytoscape({

        container: document.getElementById('cy'),

        ready: function () {
        },

        style: [ // the stylesheet for the graph
            {
                selector: 'node',
                style: {
                    'background-color': 'data(faveColor)',
                    'label': 'data(name)',
                    'shape': 'data(faveShape)',
                    'width': '100',
                    'height': '90',
                    'content': 'data(name)',
                    'text-outline-color': '#fff',
                    'color': '#000',
                    'text-wrap': 'wrap',
                    'text-max-width': 80,
                    'text-valign': 'center'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 5,
                    'line-color': 'data(faveColor)',
                    'target-arrow-color': 'data(faveColor)',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
                }
            }
        ],

        elements: elements,

        layout: {
            name: 'preset',
            padding: 10,
            roots: '#user'
        }
    })
}

function getNodeColor(provided_by) {
    if (provided_by == 'User') {
        return '#BEF7FF'
    } else if (provided_by == 'Vendor') {
        return '#FF7948'
    }
    return '#FFF1A4'
}

function getEdge(id, source, target, data_flow) {
    var color = "#000";
    if (data_flow) {
        color = "#888"
    }
    return {
        data: {
            id: id,
            source: source,
            target: target,
            faveColor: color
        }
    };
}

function parseFileNodeData(stage_id, files_list, is_input, position_y, position_x) {
    if (typeof files_list !== 'undefined') {
        var count = 0;
        var px = position_x;
        for (var i = 0, len = files_list.length; i < len; i++) {
            var file = files_list[i];
            if (!file.hasOwnProperty('output-id')) {
                if (is_input) {
                    var new_connection = getEdge('input-' + file['id'] + '-' + stage_id, file['id'], stage_id, true);
                    var py = position_y - 150;
                } else {
                    var new_connection = getEdge('output-' + file['id'] + '-' + stage_id, stage_id, file['id'], true);
                    var py = position_y + 150;
                }
                var file_node = {
                    data: {
                        id: file['id'],
                        name: file['content'],
                        faveColor: getNodeColor(file['provided-by']),
                        faveShape: 'rectangle'
                    },
                    position: {
                        x: px,
                        y: py
                    }
                };
                filesMap[file['id']] = file;
                window.flow.elements.nodes.push(file_node);
                window.flow.elements.edges.push(new_connection);
                if (px > 0) {
                    px += 150;
                } else {
                    px -= 150;
                }
                count += 1;
            } else {
                var new_connection = getEdge('outlink-' + file['output-id'] + '-' + stage_id, file['output-id'], stage_id, true);
                window.flow.elements.edges.push(new_connection);
                if (count == 0) {
                    if (px > 0) {
                        px += 150;
                    } else {
                        px -= 150;
                    }
                }
            }
        }
    }
    return count;
}

/*
 General flow plotting
 */
function loadFlow() {
    window.flow = {};
    window.flow['name'] = window.graphData['name'];

    window.flow['elements'] = {};
    window.flow.elements['nodes'] = [];
    window.flow.elements['edges'] = [];

    var stages = window.graphData['stages'];

    var emptyStages = false;
    if (isEmptyObject(stagesMap)) {
        emptyStages = true;
    }

    // unique user node
    var user = {
        data: {
            id: 'user',
            name: 'User',
            faveColor: '#f0f0f0',
            faveShape: 'rectangle'
        }
    };
    window.flow.elements.nodes.push(user);

    // nodes positioning
    var py = 200;
    var px = -200;

    for (var i = 0, len = stages.length; i < len; i++) {
        var stage = stages[i];
        var stage_node = {
            data: {
                id: stage['id'],
                name: stage['name'],
                faveColor: '#FFD077',
                faveShape: 'rectangle'
            },
            position: {
                x: px,
                y: py
            }
        };
        window.flow.elements.nodes.push(stage_node);

        if (i == 0) {
            var new_connection = getEdge('user-edge', user['data']['id'], stage['id'], false);
            window.flow.elements.edges.push(new_connection);
        }

        if (emptyStages) {
            stagesMap[stage['id']] = stage;
            $('#control-flow-from').append('<option value="' + stage['id'] + '">' + stage['name'] + '</option>');
            $('#control-flow-to').append('<option value="' + stage['id'] + '">' + stage['name'] + '</option>');
            $('#stage-list').append('<li><a href="#">' + stage['id'] + '</a></li>');
        }

        // Data files
        parseFileNodeData(stage['id'], stage['inputs'][0]['files'], true, py, px);
        var count = parseFileNodeData(stage['id'], stage['outputs'][0]['files'], false, py, px);
        if (px > 0) {
            px = count * 150 + px;
        } else {
            px = count * (-150) + px;
        }

        // Flow Control
        var flows = stage['flow-control'];
        for (var j = 0, j_len = flows.length; j < j_len; j++) {
            var flow = flows[j];
            if (flow['route-to'] !== 'User') {
                var new_connection = getEdge(flow['id'], stage['id'], flow['route-to'], false);
                window.flow.elements.edges.push(new_connection);
            } else {
                var new_connection = getEdge(flow['id'], stage['id'], user['data']['id'], false);
                window.flow.elements.edges.push(new_connection);
            }
        }

        // update positions
        if (px < 0) {
            px = 200;
        } else {
            px = -200;
        }
        py += 300;
    }

    // tools
    if (isEmptyObject(toolsMap)) {
        var tools = window.graphData['tools'];
        for (var i = 0, len = tools.length; i < len; i++) {
            var tool = tools[i];
            toolsMap[tool['id']] = tools[i];
            $('#tool-list').append('<li><a href="#">' + tool['id'] + '</a></li>');
            $('#stage-tool').append('<option>' + tool['id'] + '</a></option>');
        }
    }
    // plot the flow
    cy = getLayout(window.flow.elements);

    // add QTips
    for (var i = 0, len = stages.length; i < len; i++) {
        // Stage
        var stage = stages[i];
        addStageQTip(stage);

        // Files
        addFileQTip(stage['inputs'][0]['files']);
        addFileQTip(stage['outputs'][0]['files']);

        // Flow-control
        addFlowQTip(stage);
    }
}

// add stage qtip (including tool description and option-control module)
function addStageQTip(stage) {
    var tool = toolsMap[stage['tool']['tool-id']];

    // build tool content
    var tool_content = '<ul class="nav nav-pills">' +
        '<li class="active"><a data-toggle="pill" href="#desc-' + stage['id'] + '">Description</a></li>' +
        '<li><a data-toggle="pill" href="#option-' + stage['id'] + '">Options</a></li>' +
        '<li><a data-toggle="pill" href="#control-' + stage['id'] + '">Option-Control Module</a></li>' +
        '</ul>' +
        '<div class="tab-content">' +
        '<div id="desc-' + stage['id'] + '" class="tab-pane fade in active">' +
        '<h4>' + tool['name'] + ' <span class="badge">' + tool['version'] + '</span ></h4>' +
        tool['functionality']['description'] + '<br /><br />';

    // Notes
    var notes = tool['functionality']['notes'];
    if (typeof notes !== 'undefined')
        tool_content += '<div class="alert alert-warning">' +
            '<strong>Notes:</strong> ' + notes + '</div>';

    tool_content += '</div>';

    // tool options
    tool_content += '<div id="option-' + stage['id'] + '" class="tab-pane fade"><h4>Options</h4>';
    var options = tool['options'];
    if (!isEmptyObject(options)) {
        tool_content += '<table style="margin-top: 20px" class="table table-striped small">' +
            '<tr><th>Option</th><th>Description</th><th>Purpose</th><th>Notes</th></tr>';

        for (var j = 0, l = options.length; j < l; j++) {
            var option = options[j];
            tool_content += '<tr><td>' + option['id'] + '</td>' +
                '<td>' + option['description'] + '</td>' +
                '<td>' + option['purpose'] + '</td>' +
                '<td>' + option['notes'] + '</td></tr>';
        }
        tool_content += '</table>';
    } else {
        tool_content += 'No options defined.<br /><br />';
    }
    tool_content += '</div>';

    // tool option-control-module
    tool_content += '<div id="control-' + stage['id'] + '" class="tab-pane fade"><h4>Option-Control Module</h4>';
    var controls = stage['tool']['option-control-module'];
    if (typeof controls !== 'undefined') {
        tool_content += '<table style="margin-top: 20px" class="table table-striped small">' +
            '<tr><th>Rule</th><th>Description</th><th>Purpose</th><th>Notes</th></tr>';
        for (var j = 0, l = controls.length; j < l; j++) {
            var control = controls[j];
            tool_content += '<tr><td>' + control['id'] + '</td>' +
                '<td>' + control['description'] + '</td>' +
                '<td>' + control['purpose'] + '</td>' +
                '<td>' + control['notes'] + '</td></tr>';
        }
        tool_content += '</table>';
    } else {
        tool_content += 'No control-options defined.<br /><br />';
    }
    tool_content += '</div></div>';

    cy.$('#' + stage['id']).qtip({
        content: {
            title: stage['name'],
            text: tool_content
        },
        position: {
            my: 'left bottom',
            at: 'right top'
        },
        style: {
            classes: 'qtip-light qtip-rounded',
            tip: {
                width: 16,
                height: 8
            }
        }
    });
}

function replaceReferences(description, is_file) {
    if (is_file) {
        var match_regex = /\[\[.*?\]\]/g;
        var rep_regex = /[\[\]]/g;
    } else {
        var match_regex = /\{\{.*?\}\}/g;
        var rep_regex = /[\{\}]/g;
    }
    var refs = description.match(match_regex);
    if (refs) {
        for (var i = 0, len = refs.length; i < len; i++) {
            var ref = refs[i].replace(rep_regex, '');
            if (is_file) {
                ref = '<span class="label label-default">' + filesMap[ref]['content'] + '</span>';
            } else {
                ref = '<span class="label label-default">' + stagesMap[ref]['name'] + '</span>';
            }
            description = description.replace(refs[i], ref);
        }
    }
    return description;
}

function addFileQTip(files_list) {
    if (typeof files_list !== 'undefined') {
        for (var i = 0, len = files_list.length; i < len; i++) {
            var f = files_list[i];
            if (!f.hasOwnProperty('output-id')) {
                var file = filesMap[f['id']];

                var file_content = '<h4><span class="label label-primary">' + file['format'] + '</span>';
                if (typeof file['provided_by'] !== 'undefined') {
                    if (file['provided_by'] == 'User') {
                        var label = 'info';
                    } else {
                        var label = 'danger';
                    }
                    file_content += ' <span class="label label-' + label + '">' + file['provided_by'] + '</span>';
                } else if (file['report']) {
                    file_content += ' <span class="label label-success">Report</span>';
                }
                file_content += '</h4>';

                file['description'] = replaceReferences(file['description'], true);
                file['description'] = replaceReferences(file['description'], false);
                file_content += '<div style="margin-top: 15px; margin-bottom: 15px">' + file['description'] + '</div>';

                var notes = file['notes'];
                if (typeof notes !== 'undefined') {
                    notes = replaceReferences(notes, true);
                    notes = replaceReferences(notes, false);
                    file_content += '<div class="alert alert-warning">' +
                        '<strong>Notes:</strong> ' + notes + '</div>';
                }

                file_content += '</div>';

                cy.$('#' + file['id']).qtip({
                    content: {
                        title: file['name'],
                        text: file_content
                    },
                    position: {
                        my: 'left bottom',
                        at: 'right top'
                    },
                    style: {
                        classes: 'qtip-light qtip-rounded',
                        tip: {
                            width: 16,
                            height: 8
                        }
                    }
                });
            }
        }
    }
}

function addFlowQTip(stage) {
    var flows = stage['flow-control'];
    for (var i = 0, len = flows.length; i < len; i++) {
        var flow = flows[i];

        if (flow['route-to'].toLowerCase() !== 'user') {
            var content = '<h4><span class="label label-default">' + stage['name'] + '</span> ' +
                '<span class="glyphicon glyphicon-arrow-right"></span> ' +
                '<span class="label label-warning">' + stagesMap[flow['route-to']]['name'] + '</span></h4>';
        } else {
            var content = '<h4><span class="label label-warning">' + stage['name'] + '</span> ' +
                '<span class="glyphicon glyphicon-arrow-right"></span> ' +
                '<span class="label label-default">User</span></h4>';
        }

        // replace files and stage references by name
        flow['description'] = replaceReferences(flow['description'], true);
        flow['description'] = replaceReferences(flow['description'], false);

        content += '<div class="panel panel-default" style="margin-top: 20px">' +
            '<div class="panel-heading"><strong>Condition: </strong>' + flow['condition'] + '</div>' +
            '<div class="panel-body">' + flow['description'] + '</div>' +
            '</div>';

        var notes = flow['notes'];
        if (typeof notes !== 'undefined')
            content += '<div class="alert alert-warning">' +
                '<strong>Notes:</strong> ' + notes + '</div>';

        cy.$('#' + flow['id']).qtip({
            content: {
                title: 'Control-Flow',
                text: content
            },
            position: {
                my: 'left bottom',
                at: 'right top'
            },
            style: {
                classes: 'qtip-light qtip-rounded',
                tip: {
                    width: 16,
                    height: 8
                }
            },
            html: true
        });
    }
}

function isEmptyObject(obj) {
    for (var key in obj) {
        return false;
    }
    return true;
}