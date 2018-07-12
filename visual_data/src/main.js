
var createTable = function (){
    var num = 4;
    var data = {
        "apple": 5,
        pen: 3, 
        pineapple: 10,
        grape: 8
    }

    var maxKeyLength = 0, maxValue = 0;
    for(var key in data){
        maxKeyLength = key.length > maxKeyLength ? key.length : maxKeyLength;
        maxValue = data[key] > maxValue ? data[key] : maxValue;
    }

    var i = 0, spaceStr = "", barStr = "";
    while(true){
        spaceStr += "&#x00020;";
        barStr += "&#x02588;"
        i++;
        if(i >= maxKeyLength && i >= 20){
            break;
        }
    }

    var output = [];
    output.push(getBorder(1, maxKeyLength));
    var i = 0;
    for(var key in data){
        var keySpaceLen = maxKeyLength - key.length;
        var barLen = Math.floor((data[key]/maxValue)*20);
        var valueSpaceLen = 20 - barLen;
        var str = "&#x02502;" + spaceStr.substr(0, keySpaceLen*9) + key + "&#x02502;" + barStr.substr(0, barLen*9) + spaceStr.substr(0, valueSpaceLen*9) + "&#x02502;";
        output.push(str);
        if(++i < num){
            output.push(getBorder(3, maxKeyLength));
        }
    }

    output.push(getBorder(2, maxKeyLength));

    var chartEle = document.getElementById("chart");
    var div = document.createElement("div");

    for(var i=0; i < output.length; i++){
        var ele = document.createElement("p");
        ele.innerHTML = output[i];
        div.appendChild(ele);
    }
    chartEle.appendChild(div);
}

// “┌”（\u250c），“┐”（\u2510），“└”（\u2514），“┘”（\u2518）：图表外框转角符号
// “─”（\u2500），“│”（\u2502）：图表中的横、竖线
// “├”（\u251c），“┤”（\u2524），“┬”（\u252c），“┴”（\u2534），“┼”（\u253c）：图表中的各种交叉线
// “█”（\u2588）：用来拼柱子的字符
// “ ”（\u0020）：图表中的空格

// type 边框类型， 1 上边框， 2 下边框， 3 两条数据中间的分隔线
var getBorder = function(type, keyLength){
    var chars = [];
    if(type == 1){
        chars = ["&#x0250c;", "&#x0252c;", "&#x02510;"];
    }else if(type == 2){
        chars = ["&#x02514;", "&#x02534;", "&#x02518;"];
    }else if(type == 3){
        chars = ["&#x0251c;", "&#x0253c;", "&#x02524;"];
    }else{
        return;
    }

    var str = "", borderl = "", borderr = "";
    var i = 0;
    while(true){
        str += "&#x02500;";
        i++;
        if(i == keyLength){
            borderl = str;
        }
        if(i == 20){
            borderr = str;
        }

        if(borderr && borderl){
            break;
        }
    }

    return chars[0] + borderl + chars[1] + borderr + chars[2];
}

var getData = function(){
    
}

