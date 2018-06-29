var row = 3, column = 3; // 默认拼图规格为3*3
var rotateAnimationTime = 500; // 拼图成功后拼图块旋转动画时间
var defaultImage = "./res/bg_6.jpg"; // 默认拼图图片
var completeGame = false;  // 是否完成拼图
var uploadFile;  // 上传的图片文件
var orderArr = []; // 表示拼图块随机排列顺序的数组
var copyNode; // 拖拽生成的移动拼图块的副本节点
var selectedBlock; // 点击选中的拼图块

var blocks = [];

window.onload = function(){
    init();
    this.document.getElementById("upload-btn").onchange = handleImageChange;
    this.document.onkeydown = handleKeyDown;
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
    bgImg = bgImg || defaultImage;
    orderArr = getRandomArr();

    // 删除之前的拼图节点
    let picEle = document.getElementsByClassName("pic")[0];
    let parent = picEle.parentNode;
    parent.removeChild(picEle);
    picEle = document.createElement("div");
    addClass(picEle, "pic");
    parent.appendChild(picEle);

    Block.prototype.row = row;
    Block.prototype.column = column;
    Block.prototype.orderArr = orderArr;
    Block.prototype.bgImg = bgImg || defaultImage;
     
    for(let i = 0; i < row; i++){
        for(let j = 0; j < column; j++){
            //let block = createBlockDom(i, j, bgImg);
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
            //handleMouseDown(e, block.id);
            let id = block.id.substring(6)*1;
            blocks[id].onMouseDown(e);
        }
    });
}

function createBlockDom(rowIndex, columnIndex, bgImg){
    let index = rowIndex*column + columnIndex;
    let block = document.createElement("div");
    block.className = "block";
    block.id = "block_" + index;
    block.style.order = orderArr[index];
    block.style.width = (100/column).toFixed(2) + "%";
    block.style.height = (100/row).toFixed(2) + "%";

    let piece = document.createElement("div");
    let percentX = (columnIndex/(column-1)*100).toFixed(2);
    let percentY = (rowIndex/(row-1)*100).toFixed(2);
    piece.className = "piece";
    piece.style.backgroundImage = "url(" + bgImg + ")";
    piece.style.backgroundSize = column*100 + "% " + row*100 + "%";
    piece.style.backgroundPositionX = percentX + "%";
    piece.style.backgroundPositionY = percentY + "%";

    // 将矩形块随机旋转一个角度增加游戏难度, 50%概率下不会旋转
    var random = Math.random()*6;
    if(random < 1){
        piece.style.transform = "rotate(270deg)";
    }else if(random < 2){
        piece.style.transform = "rotate(180deg)";
    }else if(random < 3){
        piece.style.transform = "rotate(90deg)";
    }else{
        piece.style.transform = "rotate(0deg)";
    }

    let icon = document.createElement("i");
    icon.className = "icon_rotate_right rotate-icon";

    block.appendChild(piece);
    block.appendChild(icon);

    return block;
}

// 交换block1, block2两个拼图小块的位置
// keepSelected 设置是否保持选中小块的选中状态, 默认 false
function exchangeBlock(block1, block2, keepSelected) {
    if(block1.id != block2.id){
        let order_1 = block1.style.order;
        let order_2 = block2.style.order;
        block1.style.order = order_2;
        block2.style.order = order_1;

        orderArr[block2.id.substring(6)*1] = order_1*1;
        orderArr[block1.id.substring(6)*1] = order_2*1;

        if(!keepSelected){
            // 使用键盘键交换元素位置后不会取消元素选中状态
            unselectBlock();
        }
        // 检查是否完成拼图
        completeGame = check();
        if(completeGame) onSuccess();
    }
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

function rotateBlock(e){
    if(completeGame){
        return;
    }

    let piece = e.target.parentNode.getElementsByClassName("piece")[0];
    let rotate = piece.style.transform; // rotate(90deg)
    let angle = 0;
    if(rotate && rotate.indexOf("rotate(") == 0){
        angle = rotate.substring(7, rotate.indexOf("deg"));
        angle = angle*1;
    }

    //angle = angle == 360 ? 0 : angle;
    angle += 90;
    piece.style.transform = "rotate(" + angle + "deg)";
}

function handleClick(block){
    
    if(completeGame){
        return;
    }

    if(!selectedBlock){
        selectBlock(block);
    }else if(selectedBlock.id == block.id){
        // 点击选中状态的拼图会取消中状态
        unselectBlock();
    }else if(selectedBlock.preActionType == "keyboard"){
        // 选中元素上一次执行键盘交换操作，下一次的点击的时候会重新选中点击元素而不是执行交换操作
        unselectBlock();
        selectBlock(block);
    }else{
        exchangeBlock(selectedBlock, block);
    }
}

function handleMouseDown(e, blockId){

    if(completeGame || copyNode){
        return;
    }

    //获取x坐标和y坐标
    var fromX = e.clientX;
    var fromY = e.clientY;

    var targetNode = document.getElementById(blockId);
    //获取左部和顶部的偏移量
    var l = targetNode.offsetLeft;
    var t = targetNode.offsetTop;
    //var copyNode = null;

    var parent = document.getElementsByClassName("pic")[0];
    var maxX = parent.offsetWidth - targetNode.offsetWidth;
    var maxY = parent.offsetHeight - targetNode.offsetHeight;

    document.onmousemove = function(e){
        e = e || window.event;
        //获取x和y
        var toX = e.clientX;
        var toY = e.clientY;

        if(!copyNode && (Math.abs(toX-fromX) >= 5 || Math.abs(toY-fromY) >= 5)){
            copyNode = targetNode.cloneNode(true);
            copyNode.id = "block_copy";
            copyNode.style.position = "absolute";
            copyNode.style.opacity = ".9";
            document.getElementsByClassName("pic")[0].appendChild(copyNode);
            targetNode.style.opacity = 0;
            copyNode = document.getElementById("block_copy");
            copyNode.onclick = null;
            copyNode.onmousedown = null;
        }

        if(copyNode){
            let left = toX - fromX + l;
            let top = toY - fromY + t;
             // 不能超出边界
            copyNode.style.left = (left<0 ? 0 : (left>maxX ? maxX : left)) + 'px';
            copyNode.style.top = (top<0 ? 0 : (top>maxY ? maxY : top)) + 'px';
        }
    }

    document.onmouseup = function(e){
        document.onmousemove = null;
        document.onmouseup = null;
        if(copyNode){
            copyNode.style.display = "none";
            copyNode.parentNode.removeChild(copyNode);
            copyNode = null;
            e = e || window.event;
            let toBlock = getBlockIdByPosition(e.clientX, e.clientY);
            exchangeBlock(targetNode, document.getElementById(toBlock));
            targetNode.style.opacity = 1;
            targetNode = null;
        }
    }
}

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
                //selectedBlock.preActionType = "keyboard";
            }
        }
    }
}

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

function selectBlock(block){
    selectedBlock = block;
    addClass(selectedBlock, "selected");
}

function unselectBlock(){
    if(selectedBlock){
        removeClass(selectedBlock, "selected");
        selectedBlock = null;
    }
}

// 拼图是否成功
function check(){
    let result = true;

    // 判断 block 节点的id和order是否一致
    // let parentEle = document.getElementsByClassName("pic")[0];
    // let blocks = parentEle.children;
    // var num = row * column;
    // for(let i = 0; i < num; i++){
    //     // block 元素id格式为 "block_"+index
    //     if(blocks[i] && blocks[i].style.order !== blocks[i].id.substring(6)){
    //         result = false;
    //         break;
    //     }
    // }

    // 判断 orderArr 数组元素的值和下标是否一致
    if(orderArr && orderArr.length > 0){
        for(let i = 0, len = orderArr.length; i < len; i++){
            if(orderArr[i] !== i){
                result = false;
                break;
            }
        }
    }

    return result;
}

function onSuccess(){
    completeGame = true;
    // 消除选中拼图块的边框样式
    unselectBlock();

    // 按顺序依次旋转拼图块，然后再消除拼图块之间的间隔
    let blocks = document.getElementsByClassName("block");
    let rotateIndex = 0;
    for(let i = 0, len = blocks.length; i < len; i++ ){
        blocks[i].getElementsByClassName("rotate-icon")[0].style.display = "none";
        let piece = blocks[i].getElementsByClassName("piece")[0];
        let rotate = piece.style.transform;
        let angle = rotate.substring(7, rotate.indexOf("deg"));
        angle = angle*1;
        if(angle%360 != 0){
            setTimeout(function(){
                blocks[i].getElementsByClassName("piece")[0].style.transform = "none";
            }, rotateAnimationTime*rotateIndex++);
        }
    }

    setTimeout(function(){
        for(let i = 0, len = blocks.length; i < len; i++ ){
            blocks[i].style.padding = 0;
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

function parseDom(str){
    let ele = document.createElement("div");
    ele.innerHTML = str;
    return ele.children[0];
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



