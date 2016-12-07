window.graphData = {
    "name": "ASIC Design Flow",
    "tools": [
        {
            "id": "cadence-nc-sim",
            "name": "Cadence NC-Sim",
            "version": "08.20-s029",
            "functionality": {
                "description": "The tool compiles and simulates RTL design provided in a Verilog/VHDL file format.",
                "notes": "Functionality of Verilog RTL is verified using testbench. Verilog testbench file describes detailed information about which test vector to apply and how to apply."
            },
            "options": [
                {
                    "id": "cadence-option-1",
                    "description": "Compiler Optimizations",
                    "purpose": "Use to increase simulation speed. (May reduce debugging visibility)",
                    "notes": "The tool applies a variety of optimizations: merging processes, pulling constants out of loops, clock suppression, and signal collapsing."
                }
            ]
        },
        {
            "id": "synopsis-design-compiler",
            "name": "Synopsys Design Compiler",
            "version": "K-2015.06-SP5-5",
            "functionality": {
                "description": "Synthesis is used to derive a gate-level design for the given RTL design. Synthesis involves instantiation of appropriate primitive entities, for example, logic gates and flip-flops, which are in technology libraries.",
                "notes": "Design constraints (timing, area, and power) are also provided by the user."
            },
            "options": [
                {
                    "id": "synopsis-op1",
                    "description": "Optimization goal",
                    "purpose": "Use to optimize power and area."
                },
                {
                    "id": "synopsis-op2",
                    "description": "Optimization effort",
                    "purpose": "Use to adjust the level of effort towards optimization goal."
                }
            ]
        },
        {
            "id": "cadence-encounter-conformal",
            "name": "Cadence Encounter Conformal",
            "version": "11.10-s440",
            "functionality": {
                "description": "Check Verilog RTL file and Verilog netlist file for their logically equivalence"
            }
        },
        {
            "id": "cadence-encounter",
            "name": "Cadence Encounter",
            "version": "14.20",
            "functionality": {
                "description": "Transfer structural design (gate-level netlist) into a layout via placement and routing."
            },
            "options": [
                {
                    "id": "ce-op1",
                    "description": "Optimization effort",
                    "purpose": "Use to adjust the level of effort towards place and route optimization"
                }
            ]
        }
    ],
    "stages": [
        {
            "id": "stage-verilog-simulation",
            "name": "Verilog/VHDL simulation",
            "tool": {
                "tool-id": "cadence-nc-sim",
                "option-control-module": [
                    {
                        "id": "versim-rule1",
                        "description": "Compiler Optimization (-O0)",
                        "purpose": "To increase debugging visibility (maximum)",
                        "notes": "Command line option for maximum debugging visibility and minimum simulation speed."
                    },
                    {
                        "id": "versim-rule2",
                        "description": "Compiler Optimization (-O1)",
                        "purpose": "To increase debugging visibility (high)",
                        "notes": "High debugging visibility and low simulation speed."
                    },
                    {
                        "id": "versim-rule3",
                        "description": "Compiler Optimization (-O2)",
                        "purpose": "To increase debugging visibility (medium)",
                        "notes": "Medium high debugging visibility and medium low simulation speed."
                    },
                    {
                        "id": "versim-rule4",
                        "description": "Compiler Optimization (-O3)",
                        "purpose": "To increase simulation speed (medium)",
                        "notes": "Medium low debugging visibility and medium high simulation speed."
                    },
                    {
                        "id": "versim-rule5",
                        "description": "Compiler Optimization (-O4)",
                        "purpose": "To increase simulation speed (high)",
                        "notes": "Low debugging visibility and high simulation speed."
                    },
                    {
                        "id": "versim-rule6",
                        "description": "Compiler Optimization (-O5)",
                        "purpose": "To increase simulation speed (maximum)",
                        "notes": "Minimum debugging visibility and maximum simulation speed."
                    }
                ]
            },
            "inputs": [
                {
                    "files": [
                        {
                            "id": "cadence-file-1",
                            "file-number": "infile1",
                            "content": "RTL design",
                            "format": "Verilog/VHDL",
                            "provided-by": "User",
                            "description": "Includes modules with input/output list, instantiated modules, wires, registers, always blocks, etc. It must be written as synthesizable Verilog.",
                            "notes": "Hardware Description Languages (HDL) – Verilog and VHDL – are used to describe the structure and behavior using a language standardized by IEEE. As long as the same version of HDL is used, every simulator would produce the same response.",
                            "link": "file:///sync_mult.v"
                        },
                        {
                            "id": "cadence-file-2",
                            "content": "Testbench",
                            "format": "Verilog/VHDL",
                            "provided-by": "User",
                            "description": "Includes clock generation, instantiated modules, input stimuli for the instantiated modules, order of execution of input stimuli using delay statements, test cases (with corner cases), etc.",
                            "notes": "Testbench file is not restricted to be synthesizable. Typically testbench file does not contain test cases, but refers to an external file, which contains test vectors and corresponding golden responses.",
                            "link": "file:///tb_sync_mult.v"
                        },
                        {
                            "id": "cadence-file-3",
                            "optional": true,
                            "content": "Test scripts (optional)",
                            "format": "Scripting language for the OS (e.g., csh, *.bat, etc.",
                            "provided-by": "User",
                            "description": "Includes functions to apply inputs, simulate, compare, and report.",
                            "notes": "Designed to automate testing process by enabling simulation for a circuit and a testbench for multiple vectors files, each containing a different set of test cases."
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "files": [
                        {
                            "id": "cadence-outfile-1",
                            "content": "Verified RTL design",
                            "format": "Verilog/VHDL",
                            "description": "The same as input file1 if simulation passed.",
                            "notes": "Includes modules with input/output list, instantiated modules, wires, registers, always blocks, etc. It must be written as synthesizable Verilog.",
                            "link": "file:///sync_mult.v"
                        }
                    ],
                    "reports": [
                        {
                            "id": "cadence-report-1",
                            "content": "Compile errors",
                            "format": "Text",
                            "description": "Reports compile errors on infile1 or infile2."
                        },
                        {
                            "id": "cadence-report-2",
                            "content": "Test reports",
                            "format": "Text",
                            "description": "Reports mismatches between RTL response produced by simulation and the golden response."
                        }
                    ]
                }
            ],
            "flow-control": [
                {
                    "id": "cadence-flow-1",
                    "condition": "Compile error",
                    "route-to": "User",
                    "description": "User debugs the RTL design by analyzing out1 until there are no compile errors. Otherwise, we can proceed to simulation step."
                },
                {
                    "id": "cadence-flow-2",
                    "condition": "Mismatch between RTL response and golden response",
                    "route-to": "User",
                    "description": "User debugs the RTL design with out2 information. Otherwise we will have a verified RTL design."
                },
                {
                    "id": "cadence-flow-3",
                    "condition": "Success",
                    "route-to": "stage-logic-synthesizer",
                    "description": "Proceed to the next stage when out1 and out2 are resolved."
                }
            ]
        },
        {
            "id": "stage-logic-synthesizer",
            "name": "Logic synthesizer",
            "tool": {
                "tool-id": "synopsis-design-compiler",
                "option-control-module": [
                    {
                        "id": "synopsis-rule1",
                        "description": "Optimizations",
                        "purpose": "To optimize power and area",
                        "notes": "Use op1 for involving power and area optimization; Use op2 to adjust the effort level."
                    }
                ]
            },
            "inputs": [
                {
                    "files": [
                        {
                            "output-id": "cadence-outfile-1",
                            "description": "Includes modules with input/output list, instantiated modules, wires, registers, always blocks, etc."
                        },
                        {
                            "id": "synopsis-infile2",
                            "content": "Design constraints",
                            "format": "Tool Command Language (Tcl)",
                            "provided-by": "User",
                            "description": "It defines clocks, loading, timing, and sets design rule constraints."
                        },
                        {
                            "id": "synopsis-infile3",
                            "content": "Technology libraries",
                            "format": "Binary file (e.g., *.db)",
                            "provided-by": "Vendor",
                            "description": "It's compiled from library file (*.lib), which specifies what cells are in the library, their functions, pin names, timing/power characteristics."
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "files": [
                        {
                            "id": "synopsis-outfile1",
                            "content": "Gate-level netlist",
                            "format": "Verilog/VHDL",
                            "description": "Gate level design that includes elements from libraries (e.g., gates, flip-flops, a list of nets, their delays, etc.).",
                            "link": "file:///sync_mult.syn.v"
                        },
                        {
                            "id": "synopsis-outfile2",
                            "content": "Design constraints",
                            "format": "Synopsis Design Constraints (SDC)",
                            "description": "Timing information of the elements from libraries presented in the netlist file. It's used by Stage 4 -Place and Route.",
                            "notes": "As long as constraint syntax and arguments conform to the Tcl syntax rules that SDC follows, user will accept the SDC file.",
                            "link": "file:///sync_mult.sdc"
                        },
                        {
                            "id": "synopsis-outfile3",
                            "content": "Synthesis Reports",
                            "format": "Text file",
                            "description": "It includes design hierarchy, area, timing, critical path highlighting, etc.",
                            "link": "file:///sync_mult.area"
                        }
                    ]
                }
            ],
            "flow-control": [
                {
                    "id": "synopsis-flow1",
                    "condition": "Error message not synthesizable RTL design",
                    "route-to": "User",
                    "description": "the user needs to modify the RTL design and redo Stage 1."
                },
                {
                    "id": "synopsis-flow2",
                    "condition": "Error message dues to aggressive optimization effort (op2)",
                    "route-to": "User",
                    "description": "User needs to relax the constraints and repeat this stage."
                },
                {
                    "id": "synopsis-flow3",
                    "condition": "Success",
                    "route-to": "stage-lec",
                    "description": "Proceed to the next stage."
                }
            ]
        },
        {
            "id": "stage-lec",
            "name": "Logic Equivalence Check (LEC)",
            "tool": {
                "tool-id": "cadence-encounter-conformal"
            },
            "inputs": [
                {
                    "files": [
                        {
                            "output-id": "cadence-outfile-1",
                            "description": "Includes modules with input/output list, instantiated modules, wires, registers, always blocks, etc."
                        },
                        {
                            "output-id": "synopsis-outfile1",
                            "description": "Gate level design that includes elements from libraries (e.g., gates, flip-flops, a list of nets, their delays, etc.)"
                        },
                        {
                            "id": "lec-infile3",
                            "content": "Technology libraries",
                            "format": "Binary file (e.g., *.db)",
                            "provided-by": "Vendor",
                            "description": "It's compiled from library file (*.lib), which specifies what cells are in the library, their functions, pin names, timing/power characteristics."
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "files": [
                        {
                            "id": "lec-outfile1",
                            "content": "Mapped points",
                            "format": "Text file",
                            "description": "It includes the statistical information of matched, mapped, and compared points."
                        },
                        {
                            "id": "lec-outfile2",
                            "content": "Gate-level netlist",
                            "format": "Verilog/VHDL",
                            "description": "The same as lec-infile2 if LEC passed.",
                            "notes": "Gate level design that includes elements from libraries (e.g., gates, flip-flops, a list of nets, their delays, etc.)",
                            "link": "file:///sync_mult.syn.v"
                        }
                    ],
                    "reports": [
                        {
                            "id": "lec-rep1",
                            "content": "Visual outputs",
                            "format": "Visual outputs",
                            "description": "Visual outputs if LEC fails: logic cones, signal patterns, etc."
                        }
                    ]
                }
            ],
            "flow-control": [
                {
                    "id": "lec-flow1",
                    "condition": "Error message dues to library fails",
                    "route-to": "User",
                    "description": "User needs to replace the failing library with the alternative library and repeat this stage."
                },
                {
                    "id": "lec-flow2",
                    "condition": "Error message dues to aggressive synthesis constraints",
                    "route-to": "User",
                    "description": "User needs to relax the constraints and restart stage 2 - Logic synthesizer."
                },
                {
                    "id": "lec-flow3",
                    "condition": "Success",
                    "route-to": "stage-place-and-route",
                    "description": "Proceed to the next stage."
                }
            ]
        },
        {
            "id": "stage-place-and-route",
            "name": "Place and Route",
            "tool": {
                "tool-id": "cadence-encounter",
                "option-control-module": [
                    {
                        "id": "ce-rule1",
                        "description": "Timing driven placement (-timedriven)",
                        "purpose": "To target wires on timing critical paths",
                        "notes": "Command line option for making targeted wires shorter during placement. While the delay on critical paths decreases, other paths may become critical."
                    },
                    {
                        "id": "ce-rule2",
                        "description": "Congestion optimization (-doCongOpt)",
                        "purpose": "To ease congestion",
                        "notes": "Command line option for easing congestion."
                    },
                    {
                        "id": "ce-rule3",
                        "description": "Timing optimization (-lowEffort)",
                        "purpose": "To increase timing (low)",
                        "notes": "Command line option for timing optimization with low effort"
                    },
                    {
                        "id": "ce-rule4",
                        "description": "Timing optimization (-mediumEffort)",
                        "purpose": "To increase timing (medium)",
                        "notes": "Command line option for timing optimization with medium effort"
                    },
                    {
                        "id": "ce-rule5",
                        "description": "Timing optimization (-highEffort)",
                        "purpose": "To increase timing (high)",
                        "notes": "Command line option for timing optimization with high effort"
                    }
                ]
            },
            "inputs": [
                {
                    "files": [
                        {
                            "output-id": "synopsis-outfile1",
                            "description": "Gate level design that includes elements from libraries (e.g., gates, flip-flops, a list of nets, their delays, etc.)"
                        },
                        {
                            "id": "ce-infile2",
                            "content": "Technology libraries",
                            "format": "Library Exchange Format (LEF, ASCII data format)",
                            "provided-by": "Vendor",
                            "description": "Includes the design rules for routing and the abstract of the cells, no information about the internal netlist of the cells"
                        }
                    ],
                    "interaction": [
                        {
                            "id": "ce-in1",
                            "name": "Floorplan Specification"
                        },
                        {
                            "id": "ce-in2",
                            "name": "Global net connections"
                        },
                        {
                            "id": "ce-in3",
                            "name": "Power Planning"
                        },
                        {
                            "id": "ce-in4",
                            "name": "Special Routing"
                        },
                        {
                            "id": "ce-in5",
                            "name": "Placing Standard Cells"
                        },
                        {
                            "id": "ce-in6",
                            "name": "Clock Tree Synthesis (CTS)"
                        },
                        {
                            "id": "ce-in7",
                            "name": "Final Route"
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "files": [
                        {
                            "id": "ce-outfile1",
                            "content": "Post-route netlist",
                            "format": "Verilog/VHDL",
                            "description": "It is a netlist of the design mapped to technology-specific primitives. It is created from the routed design and supported by the SDF file.",
                            "link": "file:///sync_mult.vo.v"
                        },
                        {
                            "id": "ce-outfile2",
                            "content": "Delay information",
                            "format": "Standard Delay Format (SDF)",
                            "description": "SDF is a text file that contains the instance names and delay parameters for each technology library primitive and routing element specific to the design. The SDF is used to back-annotate delays into the Verilog post-route netlist file.",
                            "link": "file:///sync_mult.sdf"
                        },
                        {
                            "id": "ce-outfile3",
                            "content": "Parasitic information",
                            "format": "Standard Parasitic Format (SPF)",
                            "description": "SPF is a text file that contains parasitic data (resistance and capacitance) of wires in the design.",
                            "link": "file:///sync_mult.spf"
                        },
                        {
                            "id": "ce-outfile4",
                            "content": "Layout",
                            "format": "Graphical Database System (GDS)",
                            "description": "GDS is the industry standard for data exchange of IC layout artwork. It represents planar geometric shapes, text labels, and other information about the layout in hierarchical form.",
                            "notes": "Once successfully placed and routed, we can see all the instantiated standard cells and routed metals of the physical implementation."
                        },
                        {
                            "id": "ce-outfile5",
                            "content": "Place and Route Reports",
                            "format": "Text file",
                            "description": "It Includes information of geometry, metal density, connectivity, violation, etc."
                        }
                    ]
                }
            ],
            "flow-control": [
                {
                    "id": "ce-flow1",
                    "condition": "Error message dues to library fails",
                    "route-to": "User",
                    "description": "User needs to replace the failing library with the alternative library and restart the flow at Stage 2 – Logic Synthesizer with the new library."
                },
                {
                    "id": "ce-flow2",
                    "condition": "Error message dues to aggressive optimization effort (ce-op1)",
                    "route-to": "User",
                    "description": "User needs to relax the constraints and repeat this stage."
                },
                {
                    "id": "ce-flow3",
                    "condition": "Success",
                    "route-to": "stage-final-verilog-simulation",
                    "description": "Proceed to the next stage."
                }
            ]
        },
        {
            "id": "stage-final-verilog-simulation",
            "name": "Verilog/VHDL simulation",
            "tool": {
                "tool-id": "cadence-nc-sim",
                "option-control-module": [
                    {
                        "id": "final-rule-1",
                        "description": "Compiler Optimization (-O0)",
                        "purpose": "To increase debugging visibility (maximum)",
                        "notes": "Command line option for maximum debugging visibility and minimum simulation speed."
                    },
                    {
                        "id": "final-rule-2",
                        "description": "Compiler Optimization (-O1)",
                        "purpose": "To increase debugging visibility (high)",
                        "notes": "High debugging visibility and low simulation speed."
                    },
                    {
                        "id": "final-rule-3",
                        "description": "Compiler Optimization (-O2)",
                        "purpose": "To increase debugging visibility (medium)",
                        "notes": "Medium high debugging visibility and medium low simulation speed."
                    },
                    {
                        "id": "final-rule-4",
                        "description": "Compiler Optimization (-O3)",
                        "purpose": "To increase simulation speed (medium)",
                        "notes": "Medium low debugging visibility and medium high simulation speed."
                    },
                    {
                        "id": "final-rule-5",
                        "description": "Compiler Optimization (-O4)",
                        "purpose": "To increase simulation speed (high)",
                        "notes": "Low debugging visibility and high simulation speed."
                    },
                    {
                        "id": "final-rule-6",
                        "description": "Compiler Optimization (-O5)",
                        "purpose": "To increase simulation speed (maximum)",
                        "notes": "Minimum debugging visibility and maximum simulation speed."
                    }
                ]
            },
            "inputs": [
                {
                    "files": [
                        {
                            "output-id": "ce-outfile1",
                            "description": "It is a netlist of the design mapped to technology-specific primitives. It is created from the routed design and supported by the SDF file."
                        },
                        {
                            "id": "final-infile2",
                            "content": "Testbench",
                            "format": "Verilog/VHDL",
                            "provided-by": "User",
                            "description": "Includes clock generation, instantiated modules, input stimuli for the instantiated modules, order of execution of input stimuli using delay statements, test cases (with corner cases), etc.",
                            "notes": "Testbench file is basically same as infile2 of Stage 1. Only difference is that back annotation (in Verilog, $sdf_annotate) is added to support the infile1.",
                            "link": "file:///tb_sync_mult_pnr.v"
                        },
                        {
                            "output-id": "ce-outfile2",
                            "description": "SDF is a text file that contains the instance names and delay parameters for each technology library primitive and routing element specific to the design. The SDF is used to back-annotate delays into the Verilog post-route netlist file."
                        },
                        {
                            "id": "final-infile4",
                            "content": "Technology libraries",
                            "format": "Binary file (e.g., *.db)",
                            "provided-by": "Vendor",
                            "description": "It's compiled from library file (*.lib), which specifies what cells are in the library, their functions, pin names, timing/power characteristics"
                        },
                        {
                            "id": "final-infile5",
                            "optional": true,
                            "content": "Test scripts (optional)",
                            "format": "Scripting language for the OS (e.g., csh, *.bat, etc.)",
                            "provided-by": "User",
                            "description": "Includes functions to apply inputs, simulate, compare, and report.",
                            "notes": "Designed to automate testing process by enabling simulation for a circuit and a testbench for multiple vectors files, each containing a different set of test cases."
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "files": [
                        {
                            "id": "final-outfile1",
                            "content": "Verified post-route netlist",
                            "format": "Verilog/VHDL",
                            "description": "The same as input file1 if simulation passed.",
                            "link": "file:///sync_mult.vo.v"
                        }
                    ],
                    "reports": [
                        {
                            "id": "final-rep1",
                            "content": "Test reports",
                            "format": "Text",
                            "description": "Reports mismatches between RTL response produced by simulation and the golden response"
                        }
                    ]
                }
            ],
            "flow-control": [
                {
                    "id": "final-flow1",
                    "condition": "Mismatch between post-route netlist response and golden response",
                    "route-to": "stage-place-and-route",
                    "description": "The tool performs place & route with the less aggressive option until the mismatch of out1 in Stage 5 is resolved."
                }
            ]
        }
    ]
};