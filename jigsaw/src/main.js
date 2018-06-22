
var selectedBlock;
var row = 3, column = 3;
var completeGame = false;
var uploadImageData;
var defaultImage = "./res/bg_6.jpg";

window.onload = function(){
    init();
    this.document.getElementById("upload-btn").onchange = handleImageChange;
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
    curColumn = document.getElementById("column").value;
    curRow = document.getElementById("row").value;

    column = curColumn;
    row = curRow;

    // 删除之前的拼图节点
    let picEle = document.getElementsByClassName("pic")[0];
    let parent = picEle.parentNode;
    parent.removeChild(picEle);
    picEle = document.createElement("div");
    addClass(picEle, "pic");
    parent.appendChild(picEle);

    if(uploadImageData){
        let fr = new FileReader();
        fr.onload = function(){
            renderBlocks(this.result);
        };
        fr.readAsDataURL(uploadImageData);
    }else{
        renderBlocks(defaultImage);
    }
}

function renderBlocks(bgImg){
    bgImg = bgImg || defaultImage;
    let orderArr = getRandomArr();
    let parentEle = document.getElementsByClassName("pic")[0];

    for(let i = 0; i < row; i++){
        for(let j = 0; j < column; j++){
            let percentX = (j/(column-1)*100).toFixed(2);
            let percentY = (i/(row-1)*100).toFixed(2);
            let width = (100/column).toFixed(2);
            let height = (100/row).toFixed(2);
            let index = i*column + j;
            // <div class="block" id="block_1" style="order: 1;" onclick="handleClick('block_1')"><div class="piece" style=" background-position: 0% 0%;"></div></div>
            let block = `<div class="block" id="block_${index}" style="order: ${orderArr[index]}; width: ${width}%; height: ${height}%;" onclick="handleClick('block_${index}')" onmousedown="handleMouseDown(event, 'block_${index}')">
                        <div class="piece" style=" background-position: ${percentX}% ${percentY}%; background-size: ${column*100}% ${row*100}%;background-image: url(${bgImg});"></div>
                    </div>`;

            parentEle.appendChild(parseDom(block));
        }
    }
}

function getRandomArr(){
    let num = row * column;
    let orderArr = [];

    // 生成乱序数组
    while(orderArr.length < num){
        let order = Math.floor(Math.random()*num);
        if(orderArr.indexOf(order) == -1){
            orderArr.push(order);
        }
    }
    
    // 判断乱序数组和原始数组是否一样; 考虑游戏难度，相同的元素不超过2
    let orderNum = 0;
    for(let i = 0; i < num; i++){
        if(orderArr[i] == i){
            orderNum++;
            if(orderNum > 2){
                break;
            }
        }
    }

    if(orderNum > 2){
        orderArr = getRandomArr();
    }

    return orderArr;
}

function exchangeBlock(block1, block2) {
    if(block1.id != block2.id){
        let order_1 = block1.style.order;
        let order_2 = block2.style.order;
        block1.style.order = order_2;
        block2.style.order = order_1;
        check();
    }

    // 同一块拼图点击两次会取消第一次的选中状态
    unselectBlock();
}

function handleImageChange(){
    let imgEle = document.getElementById("upload-btn");
    uploadImageData = imgEle.files[0];
    document.getElementById("img-path").value = imgEle.value;
}

function handleClick(blockId){
    console.log("click");
    if(completeGame){
        return;
    }

    let block = document.getElementById(blockId);
    if(selectedBlock){
        exchangeBlock(selectedBlock, block);
    }else{
        selectBlock(block);
    }
}

function handleMouseDown(e, blockId){
    e = e || window.event;
    console.log("down");

    //获取x坐标和y坐标
    var fromX = e.clientX;
    var fromY = e.clientY;

    var targetNode = document.getElementById(blockId);
    //获取左部和顶部的偏移量
    var l = targetNode.offsetLeft;
    var t = targetNode.offsetTop;
    var copyNode = null;

    document.onmousemove = function(e){
        //console.log("move");
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
            console.log("move");
            copyNode.style.left = toX - fromX + l + 'px';
            copyNode.style.top = toY - fromY + t  + 'px';

            // TODO 不能超出边界
        }
    }

    document.onmouseup = function(e){
        console.log("up");
        // copyNode.style.display = "none";
        // copyNode = null;
        document.onmousemove = null;
　　　　 document.onmouseup = null;
    }
}

function getBlockIdByPosition(x, y){
    let block1 = document.getElementById("block_1");
    let left = block1.offsetLeft;
    let top = block1.offsetTop;
    let w = block1.offsetWidth;
    let h = block1.offsetHeight;

    //y - top

}

function selectBlock(block){
    selectedBlock = block;
    addClass(selectedBlock, "selected");
}

function unselectBlock(){
    removeClass(selectedBlock, "selected");
    selectedBlock = null;
}

// 拼图是否成功
function check(){
    let result = true;
    let parentEle = document.getElementsByClassName("pic")[0];
    let blocks = parentEle.children;

    var num = row * column;
    for(let i = 0; i < num; i++){
        // block 元素id格式为 "block_"+index
        if(blocks[i] && blocks[i].style.order !== blocks[i].id.substring(6)){
            result = false;
            break;
        }
    }

    completeGame = result;

    if(result) onSuccess();
}

function onSuccess(){
    completeGame = true;
    let blocks = document.getElementsByClassName("block");
    for(let i = 0, len = blocks.length; i < len; i++ ){
        blocks[i].style.padding = 0;
    }

    showMessage("success");
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



