var DEBUGGING = true;

var vertexShaderTxt = [
    'attribute vec2 position;',
    'void main() {',
    'gl_Position = vec4(position, 0.0, 1.0);',
    '}'
].join("\n");

var fragmentShaderTxt = [
    'precision highp float;',
    'uniform vec4 color;',
    'void main() {',
    'gl_FragColor = color;',
    '}'
].join('\n');

var Initialize = function () {
    console.log("Initializing WebGl");
    var unit = 10;

    var canvas =  document.getElementById("Tetris");
    var gl = canvas.getContext('webgl');

    //add Keyboard listener
    document.onkeydown = function (e) {
        switch (e.key) {
            case 'ArrowUp':
                console.log("You pressed " + e.key + '\nMoving Shape by ' + unit + ' pixels.');
                break;
            case 'ArrowDown':
                console.log("You pressed " + e.key + '\nMoving Shape by ' + unit + ' pixels.');
                break;
            case 'ArrowLeft':
                var Tx = -0.1+translation[0], Ty = 0.0, Tz = 0.0;
                translation[0] = Tx;
                update();
                console.log("You pressed " + e.key + '\nMoving Shape by ' + unit + ' pixels.');

                break;
            case 'ArrowRight':
                var Tx = 0.1+translation[0], Ty = 0.0, Tz = 0.0;
                translation[0] = Tx;
                update();
                console.log("You pressed " + e.key + '\nMoving Shape by ' + unit + ' pixels.');
        }
    };


    if(!gl) {
        console.log("WebGl not supported")
        alert("Your browser doesn't seem to support WebGl");
    }

    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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


    var cube = new Float32Array([
        -0.5, -0.5,
        0.5, -0.5,
        0.5, 0.5,
        -0.5, 0.5
    ]);

    var vertices = new Float32Array([
        -0.5, -0.5,
        0.5, -0.5,
        0.0, 0.5,
    ]);

/*    vertices = new Float32Array([
        -0.5,0.5,0.0,
        -0.5,-0.5,0.0,
        0.5,-0.5,0.0
    ]);*/

    vertices = cube;

    var vertNo = vertices.length/2;  //since they are tupels its legit
    var buffer =  gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);


    //get color
    program.color = gl.getUniformLocation(program, 'color');
    //get pos
    program.position = gl.getAttribLocation(program, 'position');
    program.translation = gl.getUniformLocation(program, "translation");

    //manipulation
    var angle = 90;
    var translation = [0.0, 0.0];
    var radian = Math.PI * angle/180.0;
    var cos = Math.cos(radian);
    var sin = Math.sin(radian);

    var col = randColors();
    update();


    function update() {
        gl.clearColor(0.5, 0.5, 0.5, 1.0); //grey background
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(program);

        //set color
        gl.uniform4fv(program.color, col);
        //connect position
        gl.enableVertexAttribArray(program.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(program.position, 2, gl.FLOAT, false, 0, 0);

        //set translation
        gl.uniform2fv(program.translation, translation);


        //draw object
        // Syntax void gl.drawArrays(mode, first, count); https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays
        //Basic SHapes http://www.informit.com/articles/article.aspx?p=2111395&seqNum=3
        gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length/2);

    }
}

var drawO =  function () {
    return;
}

function randColors(r, g, b, sat) {
    sat = sat || 1.0;
    if (!r || !b || !g) {
        r = Math.random();
        g = Math.random();
        b = Math.random();
    }
    console.log([r,g,b,sat]);
    return [r, g, b, sat];
}

function round(num, digits) {
    var t = Math.pow(10, digits);
    return (Math.round((num * t) + (digits>0?1:0)*(Math.sign(num) * (10 / Math.pow(100, digits)))) / t);
}

function addGeom(gl, vertices) {
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
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