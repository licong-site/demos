// 对象构造函数
function Block(rowIndex, columnIndex){
    // 公有属性，在对象实例化后调用
    this.rowIndex = rowIndex;
    this.columnIndex = columnIndex;
    this.id = rowIndex*column + columnIndex;
    this.order = this.orderArr[this.id];

    // 私有属性，只能在构造函数内部使用
    //var rotateAngle = 0; // 拼图旋转角度

    this.createBlockDom = function(){
        let block = document.createElement("div");
        block.className = "block";
        block.id = "block_" + this.id;
        block.style.order = this.order;
        block.style.width = (100/this.column).toFixed(2) + "%";
        block.style.height = (100/this.row).toFixed(2) + "%";
    
        let piece = document.createElement("div");
        let percentX = (this.columnIndex/(this.column-1)*100).toFixed(2);
        let percentY = (this.rowIndex/(this.row-1)*100).toFixed(2);
        piece.className = "piece";
        piece.style.backgroundImage = "url(" + this.bgImg + ")";
        piece.style.backgroundSize = this.column*100 + "% " + this.row*100 + "%";
        piece.style.backgroundPositionX = percentX + "%";
        piece.style.backgroundPositionY = percentY + "%";
    
        // 将矩形块随机旋转一个角度增加游戏难度, 50%概率下不会旋转
        var random = Math.random()*6;
        if(random < 1){
            // 拼图旋转角度
            this.rotateAngle = 270;
        }else if(random < 2){
            this.rotateAngle = 180;
        }else if(random < 3){
            this.rotateAngle = 90;
        }else{
            this.rotateAngle = 0;
        }
        piece.style.transform = "rotate(" + this.rotateAngle + "deg)";

        // 添加拼图旋转图标
        let icon = document.createElement("i");
        icon.className = "icon_rotate_right rotate-icon";
    
        block.appendChild(piece);
        block.appendChild(icon);
 
        this.element = block;
        return block;
    }

    this.click = function(){
        if(!this.selectedBlock){
            selected.apply(this);
        }else if(this.selectedBlock.id == this.id){
            // 点击选中状态的拼图会取消中状态
            unselected.apply(this);
            console.log(this);
        }
        // else if(this.prototype.preActionType == "keyboard"){
        //     // 选中元素上一次执行键盘交换操作，下一次的点击的时候会重新选中点击元素而不是执行交换操作
        //     unselected();
        //     selected();
        // }
        else{
            this.exchangeBlock();
        }
    }

    this.rotate = function(){
        let piece = this.element.getElementsByClassName("piece")[0];
        this.rotateAngle += 90;
        piece.style.transform = "rotate(" + this.rotateAngle + "deg)";
    }

    this.exchangeBlock = function(){
        let temp = this.order
        this.order = this.selectedBlock.order;
        this.element.style.order = this.order;
        this.selectedBlock.order = temp;
        this.selectedBlock.element.style.order = temp;
    }

    var selected = function(){
        this.__proto__.selectedBlock = this;
        addClass(this.element, "selected");
    }

    var unselected = function(){
        this.__proto__.selectedBlock = null;
        removeClass(this.element, "selected");
    }


// =================================私有方法=============================================

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
    

}

// 公有静态属性
Block.prototype.selectedBlock = null;


