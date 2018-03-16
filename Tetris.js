var vertexShaderTxt = [
    'precision mediump float;',
    '',
    'attribute vec2 vertPosition;',
    'attribute vec3 vertColor;',
    'varying vec3 fragColor;',
    'void main()',
    '{',
    'gl_pointsize = 10.0;',
    'fragColor = vertColor;',
    'gl_Position = vec4(vertPosition,0.0,1.0)',
    '}'
].join("\n");

var fragmentShaderTxt = [
    'precision mediump float;',
    'void main()',
    '{',
    'gl_FragColor = vec4(1.0,0.0,0.0,1.0);',
    '}'
].join('\n');

var Initialize = function () {
    console.log("Initializing WebGl");
    var canvas =  document.getElementById("Tetris");
    var ctx = canvas.getContext('webgl');

    if(!ctx) {
        console.log("WebGl not supported")
        alert("Your browser doesn't seem to support WebGl");
    }

    ctx.clearColor(0.5,0.5,0.5, 1.0);
    ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);

    //how to create a shader Mozilla Link:https://developer.mozilla.org/de/docs/Web/API/WebGL_API/Tutorial/Hinzuf%C3%BCgen_von_2D_Inhalten_in_einen_WebGL-Kontext
    var vertexShader = ctx.createShader(ctx.VERTEX_SHADER);
    var fragmentShader = ctx.createShader(ctx.FRAGMENT_SHADER);


    ctx.shaderSource(vertexShader, vertexShaderTxt);
    ctx.shaderSource(fragmentShader, fragmentShaderTxt);

    ctx.compileShader(vertexShader);
    //Check for shader Compile errors
    if(ctx.getShaderParameter(vertexShader, ctx.COMPILE_STATUS)) {
        console.error("Error compiling vertexShader", ctx.getShaderInfoLog(vertexShader))
        return;
    }

    ctx.compileShader(fragmentShader);
    if(ctx.getShaderParameter(fragmentShader, ctx.COMPILE_STATUS)) {
        console.error("Error compiling fragmentShader", ctx.getShaderInfoLog(fragmentShader))
        return;
    }

    var program =  ctx.createProgram();
    ctx.attachShader(program, vertexShader);
    ctx.attachShader(program, fragmentShader);
    ctx.linkProgram(program);

    if(!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
        console.error("Error linking program", ctx.getProgramInfoLog(program));
        return;
    }

    //for debugging reasons
    ctx.validateProgram(program);
    if(!ctx.getProgramParameter(program, ctx.VALIDATE_STATUS)) {
        console.error("Error validating program", ctx.getProgramInfoLog(program));
        return;
    }

}