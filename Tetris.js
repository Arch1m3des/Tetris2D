/*
* Assignment for GFX 2018_Lab1a
* Name: Andreas Weinbacher
* MatNo.: 1407626
* Date: 22.03.2018
* */

/*Global Variables*/
var DEBUGGING = true;
var objects = [];
var unit = 0.2;
var subunit = 0.1;
var gl;
var aspect;

var Initialize = function () {
    console.log("Initializing WebGl");
    var canvas =  document.getElementById("Tetris");
    initWebGL(canvas);
    var program = initShaders();

    prepareProgram(program);

    //create init Object + buffers
    objects.push(createObjectFromVertices(createTetromino(0)));

    update();

    function update() {
        var time = Date.now();
        console.log("Frame:" , time);

        gl.clearColor(0.5, 0.5, 0.5, 1.0); //grey background
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(program);

        //create perspectivematrix
        var pMatrix = mat4.create();
        mat4.perspective(45, aspect, 0.1, 100.0, pMatrix);

        objects.forEach(function (el) {
            //create movematrix
            var mvMatrix = mat4.create();
            mat4.identity(mvMatrix);

            //adapt movematrix
            mat4.translate(mvMatrix, mvMatrix, el.position);
            mat4.rotateZ(mvMatrix, mvMatrix, el.rotation[2]);

            if(!el.moveMatrix) {
                el.moveMatrix = mvMatrix;
            }

            if(DEBUGGING) {
                if(el.moveMatrix) {
                    console.log("obj moveMatrix: " + el.moveMatrix.toString());
                }
            }

            //pass down perspective matrix and movematrix
            gl.uniformMatrix4fv(program.uPMatrix, false, pMatrix);
            gl.uniformMatrix4fv(program.uMVMatrix, false, mvMatrix);

            //set color
            gl.uniform4fv(program.color, el.color);
            //connect position
            gl.enableVertexAttribArray(program.position);
            gl.bindBuffer(gl.ARRAY_BUFFER, el.vertexBuffer);
            //for each object || gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

            gl.vertexAttribPointer(program.position, el.numItems, gl.FLOAT, false, 0, 0);

            //draw object
            // Syntax void gl.drawArrays(mode, first, count); https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays
            //Basic SHapes http://www.informit.com/articles/article.aspx?p=2111395&seqNum=3
            gl.drawArrays(gl.TRIANGLE_FAN, 0, el.size);

        });


    }

    //add Keyboard listener
    document.onkeydown = function (e) {
        var obj = objects[objects.length-1];

        switch (e.key) {
            case 'e':
                obj.rotation[2] = (obj.rotation[2] + degToRad(90));
                console.log("You pressed " + e.key + '\nRotation Shape to ' + round(radToDeg(obj.rotation[2]),2)+ ' degrees.');
                break;
            case 'r':
                obj.rotation[2] = (obj.rotation[2] - degToRad(90));
                console.log("You pressed " + e.key + '\nRotation Shape to ' + round(radToDeg(obj.rotation[2]),2)+ ' degrees.');

                break;
            case '0':
                obj.rotation[2] = (obj.rotation[2] - degToRad(90));
                console.log("You pressed " + e.key + '\nRotation Shape to ' + round(radToDeg(obj.rotation[2]),2)+ ' degrees.');
                break;
            case '8':
                obj.rotation[2] = (obj.rotation[2] + degToRad(90));
                console.log("You pressed " + e.key + '\nRotation Shape to ' + round(radToDeg(obj.rotation[2]),2)+ ' degrees.');
                break;
            case 'ArrowUp':
                obj.position[1] = obj.position[1] + unit;
                console.log("You pressed " + e.key + '\nMoving Shape by ' + unit + ' pixels.', "the position is " + obj.position);
                break;
            case 'ArrowDown':
                obj.position[1] = obj.position[1] - unit;
                console.log("You pressed " + e.key + '\nMoving Shape by ' + unit + ' pixels.');
                break;
            case 'ArrowLeft':
                obj.position[0] = obj.position[0] - unit;
                console.log("You pressed " + e.key + '\nMoving Shape by ' + unit + ' pixels.');
                break;
            case 'ArrowRight':
                obj.position[0] = obj.position[0] + unit;
                console.log("You pressed " + e.key + '\nMoving Shape by ' + unit + ' pixels.');
                break;
            case 'x':
                objects.push(createObjectFromVertices(createTetromino(2)));
                update();
                console.log("You pressed " + e.key + '\nAdding new Tetromino.');
                break;
        }
        update();

    };

}

//FUNCTIONS_----------------------------------------------------------------------

function initWebGL(canvas) {
    gl = canvas.getContext('webgl');
    aspect = canvas.width/canvas.height;

    //webgl undefinded
    if(!gl) {
        console.log("WebGl not supported")
        alert("Your browser doesn't seem to support WebGl");
    }

    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function initShaders() {
    //how to create a shader Mozilla Link:https://developer.mozilla.org/de/docs/Web/API/WebGL_API/Tutorial/Hinzuf%C3%BCgen_von_2D_Inhalten_in_einen_WebGL-Kontext
    var vertexShader = createAndCompileShader(gl, "2d-vertex-shader");
    var fragmentShader =  createAndCompileShader(gl, "2d-fragment-shader");

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)


    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Error linking program", gl.getProgramInfoLog(program));
        return;
    }

    if(DEBUGGING) {
        gl.validateProgram(program);
        if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
            console.error("Error validating program", gl.getProgramInfoLog(program));
            return;
        }
    }

    return program;
}

function createTetromino(shape) {
    var x = [];
    var y = [];
    var vertices = [];

    switch (shape) {
        case 0: //I
            x = [0,0,0,0];
            y = [0,-1,-2,-3];
            break;
        case 1: //O
            x = [0,1,1,0];
            y = [0,0,1,1];
            break;
        case 2: //L
            x = [0,1,0,2];
            y = [0,0,-1,0];
            break;
        case 3: //J
            x = [-1,-1,0,1];
            y = [1,0,0,0];
            break;
        default:
            x = [0,1,1,0];
            y = [0,0,1,1];
            break;
    }

    for(var i=0; i<x.length; i++) {
        vertices = vertices.concat([
            -subunit+x[i]*2*subunit, -subunit+y[i]*2*subunit, 0,
            subunit+x[i]*2*subunit, -subunit+y[i]*2*subunit, 0,
            subunit+x[i]*2*subunit, subunit+y[i]*2*subunit, 0,
            -subunit+x[i]*2*subunit, subunit+y[i]*2*subunit, 0]);
    }
    return vertices;
}

function createObjectFromVertices(vertices) {
    var part = {};
    part.vertices = new Float32Array(vertices);
    part.numItems = 3;
    part.size = part.vertices.length/part.numItems;
    part.position = [0,0.8,0];
    part.translation = [0.0, 0.0, 0.0];
    part.rotation = [0,0,0];
    part.color = randColors();
    part.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, part.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, part.vertices, gl.STATIC_DRAW);

    return part;
}

function prepareProgram(program) {
    //get color
    program.color = gl.getUniformLocation(program, 'vColor');
    //get pos
    program.position = gl.getAttribLocation(program, 'aVertexPosition');
    //get movematrix
    program.uMVMatrix = gl.getUniformLocation(program, 'uMVMatrix');
    //get projectionmatrix
    program.uPMatrix = gl.getUniformLocation(program, 'uPMatrix');
}

function createAndCompileShader(gl, id) {
    if (id == undefined) {
        throw("no id set");
    }

    var shaderElement = document.getElementById(id);
    if (!shaderElement) {
        throw("The id doesn't exist" + id);
    }

    var shaderSource = shaderElement.text;
    var type;
    var typeText = "";

    if(!shaderElement.type.localeCompare("x-shader/x-vertex")){
        type = gl.VERTEX_SHADER;
        typeText = "vertexShader";
    } else if(!shaderElement.type.localeCompare("x-shader/x-fragment")) {
        type = gl.FRAGMENT_SHADER;
        typeText = "fragmentShader";
    } else {
        throw("shader type not matching vertex or fragment");
    }

    var shader = gl.createShader(type);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    //Check for shader Compile errors, because invalid shaders took 2h away from my precious lifetime
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw("Error compiling " + typeText, gl.getShaderInfoLog(shader))
    }

    return shader;
};


//HELPER FUNCTIONS ------------------------------------------------------

function randColors(r, g, b, sat) {
    sat = sat || 1.0;
    if (!r || !b || !g) {
        r = Math.random();
        g = Math.random();
        b = Math.random();
    }
    //console.log([r,g,b,sat]);
    return [r, g, b, sat];
}

function round(num, digits) {
    var t = Math.pow(10, digits);
    return (Math.round((num * t) + (digits>0?1:0)*(Math.sign(num) * (10 / Math.pow(100, digits)))) / t);
}

function degToRad(deg){
    return Math.PI*deg/180;
}

function radToDeg(rad){
    return rad*180/Math.PI;
}

