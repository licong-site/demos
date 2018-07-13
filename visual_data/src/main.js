var createTable = function (){
    // 清除页面上的错误提示语和图表
    document.getElementById("tip").innerText = "";
    var chartEle = document.getElementById("chart");
    var divEle = chartEle.getElementsByTagName("div")[0];
    if(divEle){
        chartEle.removeChild(divEle);
    }

    var data = getData();
    if(!data){
        return;
    }

    var maxKeyLength = 0, maxValue = 0;
    data.forEach( item => {
        maxKeyLength = item.name.length > maxKeyLength ? item.name.length : maxKeyLength;
        maxValue = item.value > maxValue ? item.value : maxValue;
    })

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
    data.forEach(item => {
        var keySpaceLen = maxKeyLength - item.name.length;
        var barLen = Math.floor((item.value/maxValue)*20);
        var valueSpaceLen = 20 - barLen;
        var str = "&#x02502;" + spaceStr.substr(0, keySpaceLen*9) + item.name + "&#x02502;" + barStr.substr(0, barLen*9) + spaceStr.substr(0, valueSpaceLen*9) + "&#x02502;";
        output.push(str);
        if(++i < data.length){
            output.push(getBorder(3, maxKeyLength));
        }
    })
    output.push(getBorder(2, maxKeyLength));

    var div = document.createElement("div");
    for(var i=0; i < output.length; i++){
        var ele = document.createElement("p");
        ele.innerHTML = output[i];
        div.appendChild(ele);
    }
    chartEle.appendChild(div);
}

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
    var strContent = document.getElementById("data").value;
    if(!strContent){
        return;
    }
    strContent = strContent.replace(/\r/g, ""); // IE9以上、FF、chrome的换行为\n， IE7-8的时候换行为\r\n
    strContent = strContent.replace(/\n\s*\n/g, "\n");  // 合并掉连续的换行
    var rows = strContent.split("\n");

    if(rows[rows.length-1].trim() == ""){
        rows.pop();
    }

    var count = 0;
    var data = [];
    var orderBy; 
    var orderDir; 
    var isValid = true;
    var errorMessage = "";

    for(var i=0, len=rows.length; i < len; i++){
        var item = rows[i].trim();
        if(item == ""){
            continue
        }

        if(i == 0){
            if(/\D/g.test(item)){
                isValid = false;
                errorMessage = "请在第1行输入数据条目数N, 且1<=N<=20。";
                break;
            }

            item = parseInt(item);
            if(item >= 1 && item <= 20){
                count = item;
            }else{
                isValid = false;
                errorMessage = "请在第1行输入数据条目数N, 且1<=N<=20。";
                break;
            }
        } else{
            item = item.replace(/\s+/g, " "); // 把name， value之间的多个空格合并成一个
            item = item.split(" ");
            if(item.length == 2){
                if(i == 1){
                    if(item[0].trim().toLowerCase() == "name"){
                        orderBy = "name";
                    }else if(item[0].trim().toLowerCase() == "value"){
                        orderBy = "value";
                    }else{
                        isValid = false;
                        errorMessage = "指定的数据排序方式错误";
                        break;
                    }

                    if(item[1].trim().toUpperCase() == "ASC"){
                        orderDir = "ASC";
                    }else if(item[1].trim().toUpperCase() == "DESC"){
                        orderDir = "DESC";
                    }else{
                        isValid = false;
                        errorMessage = "指定的数据排序方式错误";
                        break;
                    }
                }else{
                    // 数据条目的名称，仅包含小写字母
                    if(/[^a-z]/g.test(item[0].trim())){
                        isValid = false;
                        errorMessage = "第" + (i+1) + "行数据格式错误";
                        break;
                    }

                    if(/\D/g.test(item[1].trim())){
                        isValid = false;
                        errorMessage = "第" + (i+1) + "行数据格式错误";
                        break;
                    }

                    var val = parseInt(item[1].trim());
                    if(val < 0 || val > 1000000){
                        isValid = false;
                        errorMessage = "第" + (i+1) + "行数据的值超出范围， 0 <=value<= 1000000";
                        break;
                    }

                    data.push({name: item[0], value: parseInt(item[1].trim())});
                }
            }else{
                isValid = false;
                errorMessage = "第" + (i+1) + "行数据格式错误";
                break;
            }
        }
    }

    if(isValid && count != data.length){
        isValid = false;
        errorMessage = "输入数据与条目数不符";
    }
 
    if(!isValid){
        document.getElementById("tip").innerText = errorMessage;
    }else{
        data.sort((a, b) => {
            if(a[orderBy] > b[orderBy]){
                return orderDir == "ASC" ? 1 : -1;
            }else if((a[orderBy] < b[orderBy])){
                return orderDir == "ASC" ? -1 : 1;
            }else{
                return 0;
            }
        });
        return data;
    }
}
