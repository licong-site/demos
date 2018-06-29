// 对象构造函数
function Block(rowIndex, columnIndex){
    // 公有属性，在对象实例化后调用
    this.id = rowIndex*column + columnIndex;
    this.order = this.orderArr[this.id];

    // 私有属性，只能在构造函数内部使用
    this.getPosition = function(){
        
    }

    this.createBlockDom = function(){
        let block = document.createElement("div");
        block.className = "block";
        block.id = "block_" + this.id;
        block.style.order = this.order;
        block.style.width = (100/this.column).toFixed(2) + "%";
        block.style.height = (100/this.row).toFixed(2) + "%";
    
        let piece = document.createElement("div");
        let rowIndex = Math.floor(this.id/this.column);
        let columnIndex = this.id - rowIndex*this.column;
        let percentX = (columnIndex/(this.column-1)*100).toFixed(2);
        let percentY = (rowIndex/(this.row-1)*100).toFixed(2);
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
            this.selected();
        }else if(this.selectedBlock.id == this.id){
            // 点击选中状态的拼图会取消中状态
            this.unselected();
        }
        // else if(this.prototype.preActionType == "keyboard"){
        //     // 选中元素上一次执行键盘交换操作，下一次的点击的时候会重新选中点击元素而不是执行交换操作
        //     unselected();
        //     selected();
        // }
        else{
            let curOrder = this.order;
            let selectedBlockOrder = this.selectedBlock.order;
            this.setOrder(selectedBlockOrder);
            this.selectedBlock.setOrder(curOrder);
        }
    }

    this.rotate = function(){
        let piece = this.element.getElementsByClassName("piece")[0];
        this.rotateAngle += 90;
        piece.style.transform = "rotate(" + this.rotateAngle + "deg)";
    }

    this.move = function(toX, toY){
        if(!this.copyNode){
            this.copyNode = this.element.cloneNode(true);
            this.copyNode.id = "block_copy";
            this.copyNode.style.position = "absolute";
            this.copyNode.style.opacity = ".9";
            this.copyNode.onclick = null;
            this.copyNode.onmousedown = null;
            this.element.parentNode.appendChild(this.copyNode);
            this.element.style.opacity = 0;
        }

        let fromX = this.dragEvent.fromX;
        let fromY = this.dragEvent.fromY;
        //获取左部和顶部的偏移量
        var l = this.element.offsetLeft;
        var t = this.element.offsetTop;
        let left = toX - fromX + l;
        let top = toY - fromY + t;
        let maxX = this.element.parentNode.offsetWidth - this.element.offsetWidth;
        let maxY = this.element.parentNode.offsetHeight - this.element.offsetHeight;
        // 不能超出边界
        this.copyNode.style.left = (left<0 ? 0 : (left>maxX ? maxX : left)) + 'px';
        this.copyNode.style.top = (top<0 ? 0 : (top>maxY ? maxY : top)) + 'px';
    }

    this.endMove = function(toOrder){
        if(this.copyNode){
            this.copyNode.style.display = "none";
            this.copyNode.parentNode.removeChild(this.copyNode);
            this.copyNode = null;
            if(this.order != toOrder){
                this.setOrder(toOrder);
            }
            this.element.style.opacity = 1;
        }
    }

    this.onMouseDown = function(e){

        if(this.dragEvent){
            return;
        }

        this.__proto__.dragEvent = {
            //获取x坐标和y坐标
            fromX: e.clientX,
            fromY: e.clientY,
            block: this
        }
        
        document.onmousemove = function(e){
            if(!Block.prototype.dragEvent){
                return;
            }

            e = e || window.event;
            var toX = e.clientX;
            var toY = e.clientY;
            var fromX = Block.prototype.dragEvent.fromX;
            var fromY = Block.prototype.dragEvent.fromY;

            if(Math.abs(toX-fromX) >= 5 || Math.abs(toY-fromY) >= 5){
                if(Block.prototype.selectedBlock){
                    Block.prototype.selectedBlock.unselected();
                }
                Block.prototype.dragEvent.block.move(toX, toY);
            }
        }
        
        document.onmouseup = function(e){
            document.onmousemove = null;
            document.onmouseup = null;

            if(Block.prototype.dragEvent && Block.prototype.dragEvent.block && Block.prototype.dragEvent.block.copyNode){
                e = e || window.event;
                // ie8及以下不支持 event.pageX
                let toBlock = getBlockByPosition(e.pageX, e.pageY);
                let toOrder = toBlock.order;
                let formOrder = Block.prototype.dragEvent.block.order;
                Block.prototype.dragEvent.block.endMove(toOrder);
                if(formOrder != toOrder){
                    toBlock.setOrder(formOrder);
                }
            }

            Block.prototype.dragEvent = null;
        }
        
    }

    this.setOrder = function(order, keepSelected){
        this.order = order;
        this.element.style.order = order;
        this.__proto__.orderArr[this.id] = order;
        
        let completeGame = true;
        for(let i=0, len=this.orderArr.length; i<len; i++){
            if(this.orderArr[i] != i){
                completeGame = false;
                break;
            }
        }

        if(completeGame || (this.selectedBlock && this.selectedBlock.id == this.id && !keepSelected)){
            this.unselected();
        }


    }

    this.selected = function(){
        this.__proto__.selectedBlock = this;
        addClass(this.element, "selected");
    }

    this.unselected = function(){
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
Block.prototype.dragEvent = null; // 拖拽时在页面上移动的拼图块

