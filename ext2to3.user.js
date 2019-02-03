// ==UserScript==
// @name         Scratch ext2to3
// @namespace    http://tampermonkey.net/
// @version      0.6a
// @description  try to take over the world!
// @author       NitroCipher and Jamesbmadden
// @match        https://scratch.mit.edu/convert/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @require      https://cdn.rawgit.com/beautify-web/js-beautify/v1.8.9/js/lib/beautify.js
// ==/UserScript==

(function() {
    'use strict';
    var fullArg = "";
    var url = getUrlVars()["url"];
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
    var argValue = 0;
    var argDescriptor;
    var argDefaults;
    $.ajax({
        url: url,
        text: "text/plain"
    }).done( function (data) {
        //alert("done");
        let name, descriptor, ext, id;
        const ScratchExtensions = { // Get the properties of the extension
            register: (_name, _descriptor, _ext) => {
                name = _name;
                descriptor = _descriptor;
                ext = _ext;
                id = _name.replace(/ /g, '');
            }
        }
        eval(data);

        //here we go...
        let info = {
            id, // Set the id to the extension's name without spaces
            name, // Set the display name
            blocks: descriptor.blocks.map((block, index) => { // convert the block to the new format
                return {
                    opcode: block[2],
                    blockType: getBlockType(block[0]), // Get the block type
                    text: getNewArgs(block), // TODO: Change the inputs to the new format
                    arguments: argDescriptor
                }
            })
        };
        /* Create a String with the code for the Scratch 3 extension */
        let result = `class ${id} {
            getInfo() {
                return ${JSON.stringify(info)};
            }
            ${convertFunctions(descriptor, ext)}
        }
        Scratch.extensions.register(new ${id}());`; // TODO: Add functions
        $(".box-content").css("text-align", "left");
        $(".box-content").css("padding-left", "50px");
        $(".box-content").html("<pre>" + js_beautify(result) + "</pre>");
    });

    function getUrlVars() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        return vars;
    }

    function getBlockType (oldType) {
        switch (oldType) {
            case ' ': return 'command';
            case 'w': return 'command';
            case 'r': return 'reporter';
            case 'R': return 'reporter';
            case 'b': return 'Boolean';
            case 'h': return 'hat';
        }
    }

    function getNewArgs (oldText) {
        var splitArg = oldText[1].split(" ");
        argValue = 0;
        fullArg = "";
        argDescriptor = {};
        argDefaults = oldText.slice(3, oldText.length);
        console.log(argDefaults);
        splitArg.forEach(switchArgs);
        return fullArg.substr(1);
    }

    function switchArgs(oldText) {
        var myArg;
        switch (oldText) {
            default:
                fullArg = fullArg + " " + oldText;
                break;
            case '%b':
                myArg = letters[argValue];
                fullArg = fullArg + " [" + myArg + "]";
                argDescriptor[myArg] = {
                    "type": "Boolean",
                    "defaultValue": argDefaults[argValue],
                };
                argValue++;
                break;
            case '%n':
                myArg = letters[argValue];
                fullArg = fullArg + " [" + myArg + "]";
                argDescriptor[myArg] = {
                    "type": "number",
                    "defaultValue": argDefaults[argValue],
                };
                argValue++;
                break;
            case '%s':
                myArg = letters[argValue];
                fullArg = fullArg + " [" + myArg + "]";
                argDescriptor[myArg] = {
                    "type": "string",
                    "defaultValue": argDefaults[argValue],
                };
                argValue++;
                break;
        }
    }

    function convertFunctions (descriptor, ext) {
        let functions = '';
        descriptor.blocks.forEach((block, index) => {
            let func = ext[block[2]]; // Get the function for the block
            functions += func.toString().replace('function', block[2]); // Convert to string and replace the function prefix with the function name
            // TODO: Change the arguments to the new behavior (probably involving the argument converter)
        });
        return functions;
    }
    // Your code here...
})();
