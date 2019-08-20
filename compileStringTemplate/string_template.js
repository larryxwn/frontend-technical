//根据模板，生成并返回一个解析函数parse
//parse 需要定义一个存放代码的数组，静态代码和动态代码（js）都存，然后合并后返回，只要输入数据执行此函数会自动合成html并返回
function compile1(template){
    const evalReg = /<%=(.+?)%>/g;
    const exprReg = /<%(.+?)%>/g; 
    template = template.replace(evalReg,'\"); r.push($1);r.push(\"');
    template = template.replace(exprReg,'\"); $1 r.push(\"');
    template = template.replace(/[\r\n]/g,""); 

    template = 'r.push(\"'+template+'\");';
    // function parse(... 外部需要加小括号，表达式才会有返回值，不加小括号就表示声明了函数
    return '(function parse(data){' +
        'var r = [];' +
        template+
        '' +
        '; return r.join("")' +
        '})';
}
