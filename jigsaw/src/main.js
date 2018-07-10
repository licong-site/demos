var row = 3, column = 3; // 默认拼图规格为3*3
var rotateAnimationTime = 500; // 拼图成功后拼图块旋转动画时间
var defaultImage = "./res/bg_6.jpg"; // 默认拼图图片
var completeGame = false;  // 是否完成拼图
var uploadFile;  // 上传的图片文件
var blocks = [];

window.onload = function(){
    init();
    this.document.getElementById("upload-btn").onchange = handleImageChange;
    this.document.onkeydown = handleKeyDown;
    document.body.addEventListener('customComplete', onSuccess);
};

function init(){
    // 设置默认值
    document.getElementById("column").value = column;
    document.getElementById("row").value = row;
    renderBlocks();
}

// 点击重新开始，打乱、重新生成拼图
function reRender(){
    completeGame = false;
    column = document.getElementById("column").value;
    row = document.getElementById("row").value;

    if(uploadFile){
        let fr = new FileReader();
        fr.onload = function(){
            renderBlocks(this.result);
        };
        fr.readAsDataURL(uploadFile);
    }else{
        renderBlocks(defaultImage);
    }
}

function renderBlocks(bgImg){
    // 删除之前的拼图节点
    let picEle = document.getElementsByClassName("pic")[0];
    let parent = picEle.parentNode;
    parent.removeChild(picEle);
    blocks = [];
    
    // 生成新的dom
    picEle = document.createElement("div");
    addClass(picEle, "pic");
    parent.appendChild(picEle);

    Block.prototype.row = row;
    Block.prototype.column = column;
    Block.prototype.orderArr = getRandomArr();
    Block.prototype.bgImg = bgImg || defaultImage;
     
    for(let i = 0; i < row; i++){
        for(let j = 0; j < column; j++){
            let block = new Block(i, j)
            block.createBlockDom();
            blocks.push(block);
            picEle.appendChild(block.element);
        }
    }

    picEle.addEventListener("click", function(e){
        if(completeGame){
            return;
        }

        e = e || window.event;
        let target = e.target || e.srcElement;
        let block = target.parentNode;
        if(block.id){
            let id = block.id.substring(6)*1;
            if(target.className.indexOf("rotate-icon") != -1){
                blocks[id].rotate();
            }else if(block.id.indexOf("block_") == 0){
                blocks[id].click();
            }
        }
    });

    picEle.addEventListener("mousedown", function(e){
        if(completeGame || Block.prototype.dragEvent){
            return;
        }

        e = e || window.event;
        let target = e.target || e.srcElement;
        let block = target.parentNode;
        if(block && block.id && block.id.indexOf("block_") == 0){
            let id = block.id.substring(6)*1;
            blocks[id].onMouseDown(e);
        }
    });
}

function changeBlocksNum(e){
    e = e || window.event;
    let target = e.target || e.srcElement;

    if(hasClass(target, "disabled-drop-icon")){
        return;
    }

    let inputEle = target.parentNode.getElementsByTagName("input")[0];
    let min = 2, max = 5;
    let num, upEle, downEle;
    if(hasClass(target, "up-icon")){
        num = 1;
        upEle = target;
        downEle = target.parentNode.getElementsByClassName("down-icon")[0];
    }else{
        num = -1;
        downEle = target;
        upEle = target.parentNode.getElementsByClassName("up-icon")[0];
    }

    let value = inputEle.value*1 + num;
    inputEle.value = value;

    if(value == min){
        addClass(downEle, "disabled-drop-icon");
    }else{
        removeClass(downEle, "disabled-drop-icon");
    }

    if(value == max){
        addClass(upEle, "disabled-drop-icon");
    }else{
        removeClass(upEle, "disabled-drop-icon");
    }
}

function handleImageChange(){
    let imgEle = document.getElementById("upload-btn");
    if(imgEle.files[0]){
        let separator = imgEle.files[0].name.indexOf(".");
        let ext = imgEle.files[0].name.substring(separator+1);
        if(ext != "jpg" && ext != "png" && ext != "jpeg" && ext != "gif"){
            showMessage("只能上传.jpg  .png  .jpeg  .gif类型的文件!");
        }else{
            uploadFile = imgEle.files[0];
            document.getElementById("img-path").value = imgEle.value;
        }
    }
}

// 通过键盘上下左右键移动拼图块
function handleKeyDown(e){
    if(Block.prototype.selectedBlock){
        e = e || window.event;

        let order = Block.prototype.selectedBlock.order;
        let column = Block.prototype.column;
        let row = Block.prototype.row;
        let rowIndex = Math.floor(order/column);
        let columnIndex = order - rowIndex*column;

        let toBlockOrder = -1;

        if(e && e.keyCode == 37){ // 左
            if(columnIndex === 0){
                return;
            }else{
                toBlockOrder = order - 1;
            }
        }else if(e && e.keyCode == 38){ // 上
            if(rowIndex === 0){
                return;
            }else{
                toBlockOrder = order - column;
            }
        }else if(e && e.keyCode == 39){ // 右
            if(columnIndex === column-1){
                return;
            }else{
                toBlockOrder = order + 1;
            }
        }else if(e && e.keyCode == 40){ // 下
            if(rowIndex === row-1){
                return;
            }else{
                toBlockOrder = order + column;
            }
        }

        if(toBlockOrder !== -1){
            let toBlock;
            for(let i=0, len=blocks.length; i<len; i++){
                if(blocks[i].order == toBlockOrder){
                    toBlock = blocks[i];
                    break;
                }
            }

            if(toBlock){
                toBlock.setOrder(order);
                Block.prototype.selectedBlock.setOrder(toBlockOrder, true);
            }
        }
    }
}

// 根据位置获取对应的拼图块
function getBlockByPosition(x, y){
    let block = blocks[0].element;
    let parent = blocks[0].element.parentNode;
    let columnIndex = Math.floor((x - parent.offsetLeft - 4) / block.offsetWidth);
    columnIndex = columnIndex < 0 ? 0 : (columnIndex > column-1 ? column-1 : columnIndex);
    let rowIndex = Math.floor((y - parent.offsetTop - 4) / block.offsetHeight);
    rowIndex = rowIndex < 0 ? 0 : (rowIndex > row-1 ? row-1 : rowIndex);
    let order = rowIndex*column + columnIndex;
    let id;
    for(let i=0, len=blocks.length; i<len; i++){
        if(blocks[i].order == order){
            id = i;
            break;
        }
    }
    return blocks[id];
}

// 生成拼图块的随机排列顺序
function getRandomArr(){
    let num = row * column;
    let randomArr = [];

    // 生成乱序数组
    while(randomArr.length < num){
        let order = Math.floor(Math.random()*num);
        if(randomArr.indexOf(order) == -1){
            randomArr.push(order);
        }
    }
    
    // 判断乱序数组和原始数组是否一样; 考虑游戏难度，相同的元素不超过2
    let orderNum = 0;
    for(let i = 0; i < num; i++){
        if(randomArr[i] == i){
            orderNum++;
            if(orderNum > 2){
                break;
            }
        }
    }

    if(orderNum > 2){
        randomArr = getRandomArr();
    }

    return randomArr;
}

// 拼图成功后，将拼图合成一张完整图片，并提示用户
function onSuccess(){
    completeGame = true;

    // 按顺序依次旋转拼图块，然后再消除拼图块之间的间隔
    let rotateIndex = 0;
    for(let i = 0, len = blocks.length; i < len; i++ ){
        blocks[i].element.getElementsByClassName("rotate-icon")[0].style.display = "none";
        let angle = blocks[i].rotateAngle;
        if(angle%360 != 0){
            setTimeout(function(){
                blocks[i].rotate(Math.ceil(angle/360)*360);
            }, rotateAnimationTime*rotateIndex++);
        }
    }

    setTimeout(function(){
        for(let i = 0, len = blocks.length; i < len; i++ ){
            blocks[i].element.style.padding = 0;
        }

        showMessage("success");
    }, rotateAnimationTime*rotateIndex);
}
// ======================================================================

function showMessage(info){
    setTimeout(function(){
        alert(info);
    }, 100);
}

function hasClass(ele, cls) {
    return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}

function addClass(ele, cls) {
    if (!this.hasClass(ele,cls)) ele.className += " "+cls;
}

function removeClass(ele, cls) {
    if (hasClass(ele,cls)) {
        var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
        ele.className=ele.className.replace(reg,' ');
    }
}
