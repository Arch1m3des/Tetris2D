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
var program;
var aspect;
var lastTime = 0;
var cw = true;
var moveSpeed = 5;
var rotSpeed = 20;

var Initialize = function () {
    console.log("Initializing WebGl");
    var canvas =  document.getElementById("Tetris");
    initWebGL(canvas);
    program = initShaders();

    prepareProgram(program);

    //create init Object + buffers
/*    var part1 = createObjectFromVertices(createTetromino(0));
    part1.position = [0.8,0,0];
    part1.toPosition = part1.position;
    objects.push(part1);

    var part2 = createObjectFromVertices(createTetromino(1));
    part2.position = [-0.6,0,0];
    part2.toPosition = part2.position;
    objects.push(part2);*/


    console.log("RandShape", randTetromino);
    objects.push(createObjectFromVertices(createTetromino(0)));

    play();



    //add Keyboard listener
    document.onkeydown = function (e) {
        var obj = objects[objects.length-1];

        switch (e.key) {
            case 'e':
                if (obj.toRotation[2] == obj.rotation[2]) {
                    obj.toRotation[2] += degToRad(90);
                    cw = false;
                    lastTime = (new Date).getTime()/10;
                    console.log("You pressed " + e.key + '\nRotation Shape to ' + round(radToDeg(obj.toRotation[2]),2)+ ' degrees.');
                }
                break;
            case 'r':
                if (obj.toRotation[2] == obj.rotation[2]) {
                    cw = true;
                    obj.toRotation[2] -= degToRad(90);
                    lastTime = (new Date).getTime()/10;
                    console.log("You pressed " + e.key + '\nRotation Shape to ' + round(radToDeg(obj.toRotation[2]),2)+ ' degrees.');
                }
                break;
            case '0':
                obj.toRotation[2] -= degToRad(90);
                obj.toRotation[2] = obj.toRotation[2]%(Math.PI*2);

                console.log("You pressed " + e.key + '\nRotation Shape to ' + round(radToDeg(obj.toRotation[2]),2)+ ' degrees.');
                break;
            case '8':
                obj.toRotation[2] += degToRad(90);
                obj.toRotation[2] = obj.toRotation[2]%(Math.PI*2);

                console.log("You pressed " + e.key + '\nRotation Shape to ' + round(radToDeg(obj.toRotation[2]),2)+ ' degrees.');
                break;
            case 'ArrowUp':
                obj.toPosition[1] = obj.toPosition[1] + unit;
                lastTime = (new Date).getTime()/10;
                console.log("You pressed " + e.key + '\nMoving Shape by ' + unit + ' pixels.', "the position is " + obj.toPosition);
                break;
            case 'ArrowDown':
                obj.toPosition[1] = obj.toPosition[1] - unit;
                lastTime = (new Date).getTime()/10;
                console.log("You pressed " + e.key + '\nMoving Shape by ' + unit + ' pixels.');
                break;
            case 'ArrowLeft':
                obj.toPosition[0] = obj.toPosition[0] - unit;
                lastTime = (new Date).getTime()/10;
                console.log("You pressed " + e.key + '\nMoving Shape by ' + unit + ' pixels.');
                break;
            case 'ArrowRight':
                obj.toPosition[0] = obj.toPosition[0] + unit;
                lastTime = (new Date).getTime()/10;
                console.log("You pressed " + e.key + '\nMoving Shape by ' + unit + ' pixels.');
                break;
            case 'x':
                console.log("You pressed " + e.key + '\nAdding new Tetromino.');
                objects.push(createObjectFromVertices(createTetromino(randTetromino())));
                break;
        }
        update();

    };

}

//FUNCTIONS_----------------------------------------------------------------------
function play() {
    animate();
    update();

    requestAnimationFrame(play);
}

function animate() {
    //animate only last created object
    var obj = objects[objects.length-1];

    if (obj.toRotation[2] == obj.rotation[2] && obj.toPosition == obj.position) {
        return false;
    }

    //altered but originally from https://developer.mozilla.org/de/docs/Web/API/WebGL_API/Tutorial/Objekte_mit_WebGL_animieren
    var currentTime = (new Date).getTime()/10;
    if (lastTime) {
        var elapsed = currentTime - lastTime;

        if(obj.position[0] != obj.toPosition[0]) {
            var moveDist = obj.toPosition[0] - obj.position[0];  //>right+, <left-
            var increment = moveSpeed * elapsed / 1000;

            console.log("MoveDist: ", moveDist, " Increment: ", increment, " Elapsed: ", elapsed);
            if (2 * increment > Math.abs(moveDist)) {
                console.log("PosX reached")
                obj.position[0] = obj.toPosition[0];
            }
            else if (moveDist > 0) {
                obj.position[0] += increment;
            }
            else {
                obj.position[0] -= increment;
            }
        }

        if(obj.position[1] != obj.toPosition[1]) {
            var moveDist = obj.toPosition[1] - obj.position[1];  //>up+, <down-
            var increment = moveSpeed * elapsed / 1000;

            console.log("MoveDist: ", moveDist, " Increment: ", increment, " Elapsed: ", elapsed);
            if (2 * increment > Math.abs(moveDist)) {
                console.log("PosY reached")
                obj.position[1] = obj.toPosition[1];
            }
            else if (moveDist > 0) {
                obj.position[1] += increment;
            }
            else {
                obj.position[1] -= increment;
            }
        }

        if(obj.rotation[2] != obj.toRotation[2]) {
            var rotDist= Math.abs(obj.toRotation[2] - obj.rotation[2]);
            var increment = rotSpeed * elapsed / 1000;
            console.log("RotDist: ", round(radToDeg(rotDist),2), "increment: ", radToDeg(increment), "currentRot: ", radToDeg(obj.rotation[2]), "elapsed", elapsed ,"direction: ", cw ? "clockwise" : "counterclockwise");

            //break condition
            if(2*increment > rotDist) {
                obj.rotation[2] = obj.toRotation[2];
                console.log("rotDest reached");
            } else if(cw) {
                obj.rotation[2] -= increment;
            } else {
                obj.rotation[2] += increment;
            }

        }

    }
    return true;
    lastTime = currentTime;

}

function update() {
    gl.clearColor(0.5, 0.5, 0.5, 1.0); //grey background
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    //create perspectivematrix
    var pMatrix = mat4.create();
    mat4.perspective(45, aspect, 0.1, 100.0, pMatrix);

    objects.forEach(function (el) {

        if(el.fixed == true) {
            //pass down movematrix
            gl.uniformMatrix4fv(program.uMVMatrix, false, el.mvMatrix);

        } else {
            var mvMatrix = mat4.create();
            var moveMatrix = mat4.create();
            mat4.identity(moveMatrix);
            var rotMatrix = mat4.create();
            mat4.identity(rotMatrix);

            //adapt mvMatrix
            mat4.translate(moveMatrix, moveMatrix, el.position);
            mat4.rotateX(rotMatrix, rotMatrix, el.rotation[0]);
            mat4.rotateY(rotMatrix, rotMatrix, el.rotation[1]);
            mat4.rotateZ(rotMatrix, rotMatrix, el.rotation[2]);
            mvMatrix = mat4.multiply(mvMatrix, moveMatrix, rotMatrix);

            //put matrix to object
            el.mvMatrix = mvMatrix;
            gl.uniformMatrix4fv(program.uMVMatrix, false, mvMatrix);
        }

        //pass down perspective matrix and movematrix
        gl.uniformMatrix4fv(program.uPMatrix, false, pMatrix);

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


function initWebGL(canvas) {
    gl = canvas.getContext('webgl');
    aspect = canvas.clientWidth/canvas.clientHeight;

    //webgl undefinded
    if(!gl) {
        console.log("WebGl not supported")
        alert("Your browser doesn't seem to support WebGl");
    }
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

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
            x = [-0.5,0.5,0.5,-0.5];
            y = [-0.5,-0.5,0.5,0.5];
            break;
        case 2: //L
            x = [0,1,0,2];
            y = [0,0,-1,0];
            break;
        case 3: //J
            x = [-1,-1,0,1];
            y = [1,0,0,0];
            break;
        case 4: //Z
            x = [1,1,0,0];
            y = [1,0,0,-1];
            break;
        case 5: //T
            x = [0,0,0,1];
            y = [0,-1,1,0];
            break;
        default:
            x = [0,1,0,1];
            y = [0,0,1,1];
            break;
    }

    for(var i=0; i<x.length; i++) {
        vertices = vertices.concat([
            -subunit+x[i]*2*subunit, -subunit+y[i]*2*subunit, 0,
             subunit+x[i]*2*subunit, -subunit+y[i]*2*subunit, 0,
             subunit+x[i]*2*subunit,  subunit+y[i]*2*subunit, 0,
            -subunit+x[i]*2*subunit,  subunit+y[i]*2*subunit, 0]);
    }
    console.log("created Shape: ", shape);
    vertices.type = shape;

    return vertices;
}

function createObjectFromVertices(vertices) {
    var part = {};
    part.no = objects.length;
    part.mvMatrix = mat4.create();
    mat4.identity(part.mvMatrix);
    part.vertices = new Float32Array(vertices);
    part.type = vertices.type;
    part.numItems = 3;
    part.size = part.vertices.length/part.numItems;

    part.position = new Float32Array(3);
    part.position[1] = 0.8;
    part.toPosition = new Float32Array(3);
    part.toPosition[1] = 0.8;

    part.translation = new Float32Array(3);
    part.rotation = new Float32Array(3);
    part.toRotation = new Float32Array(3);

    //if its a O type that move by 0.5 units left & up
    if(part.type == 0) {
        console.log("Vert type: ", part.type);
        part.position[1] -= 0.5*unit;
        part.toPosition[1] -= 0.5*unit;
        part.position[0] += 0.5*unit;
        part.toPosition[0] += 5*unit;

    }
    part.color = randColors();
    part.fixed = false;
    part.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, part.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, part.vertices, gl.STATIC_DRAW);

    //no need of animating other objects
    for(var i=0; i<objects.length; i++) {
        objects[i].fixed = true;
    }

    console.log("Created new Object: ", part.no);

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
function randTetromino() {
    //random objects
    return round(Math.random()/2.0*10,0);
}

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

