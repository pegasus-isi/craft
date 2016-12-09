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
                filesMap[file['id']] = {
                    id: file['id'],
                    name: file['content'],
                    format: file['format'],
                    provided_by: file['provided-by'],
                    description: file['description'],
                    notes: file['notes']
                };
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

function loadFlow() {
    window.flow = {};
    window.flow['name'] = window.graphData['name'];

    window.flow['elements'] = {};
    window.flow.elements['nodes'] = [];
    window.flow.elements['edges'] = [];

    var stages = window.graphData['stages']; // have 'id' and 'name' attributes

    var user = {
        data: {
            id: 'user',
            name: 'User',
            faveColor: '#f0f0f0',
            faveShape: 'rectangle'
        }
    };
    window.flow.elements.nodes.push(user);
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
        stagesMap[stage['id']] = stage['name'];

        // Data files
        parseFileNodeData(stage['id'], stage['inputs'][0]['files'], true, py, px);
        var count = parseFileNodeData(stage['id'], stage['outputs'][0]['files'], false, py, px);
        if (px > 0) {
            px = count * 150 + px;
        } else {
            px = count * (-150) + px;
        }
        parseFileNodeData(stage['id'], stage['outputs'][0]['reports'], false, py, px);

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

    // Tools
    var tools = window.graphData['tools'];
    for (var i = 0, len = tools.length; i < len; i++) {
        var tool = tools[i];
        toolsMap[tool['id']] = {
            id: tool['id'],
            name: tool['name'],
            version: tool['version'],
            functionality: {
                description: tool['functionality']['description'],
                notes: tool['functionality']['notes']
            },
            options: []
        };
        var options = tool['options'];
        if (typeof options !== 'undefined') {
            for (var j = 0, l = options.length; j < l; j++) {
                var option = options[j];
                toolsMap[tool['id']]['options'].push({
                    id: option['id'],
                    description: option['description'],
                    purpose: option['purpose'],
                    notes: option['notes']
                });
            }
        }
    }
}

var toolsMap = {};
var filesMap = {};
var stagesMap = {};
loadFlow();

document.addEventListener('DOMContentLoaded', function () {
    var cy = window.cy = cytoscape({

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

        elements: window.flow.elements,

        layout: {
            name: 'preset',
            // randomize: true,
            // directed: true,
            padding: 10,
            roots: '#user',
            // avoidOverlap: true
        }
    });

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
                    ref = '<span class="label label-default">' + filesMap[ref]['name'] + '</span>';
                } else {
                    ref = '<span class="label label-default">' + stagesMap[ref] + '</span>';
                }
                description = description.replace(refs[i], ref);
            }
        }
        return description;
    }

    function addFileQTip(cy, files_list) {
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

    var stages = window.graphData['stages'];
    for (var i = 0, len = stages.length; i < len; i++) {
        var stage = stages[i];
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
        if (options.length > 0) {
            tool_content += '<table style="margin-top: 20px" class="table table-striped">' +
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
            tool_content += '<table style="margin-top: 20px" class="table table-striped">' +
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

        // Files
        addFileQTip(cy, stage['inputs'][0]['files']);
        addFileQTip(cy, stage['outputs'][0]['files']);
        addFileQTip(cy, stage['outputs'][0]['reports']);

        // Flow-control
        var flows = stage['flow-control'];
        for (var j = 0, j_len = flows.length; j < j_len; j++) {
            var flow = flows[j];

            if (flow['route-to'] !== 'User') {
                var content = '<h4><span class="label label-default">' + stage['name'] + '</span> ' +
                    '<span class="glyphicon glyphicon-arrow-right"></span> ' +
                    '<span class="label label-warning">' + stagesMap[flow['route-to']] + '</span></h4>';
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
                '</div>'

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
});
