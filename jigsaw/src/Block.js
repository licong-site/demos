// 拼图块对象的构造函数
function Block(rowIndex, columnIndex){

    this.id = rowIndex*this.column + columnIndex;
    this.order = this.orderArr[this.id];

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
    
        // 将矩形块随机旋转一个角度增加游戏难度
        if(this.column == this.row){
            var random = Math.floor(Math.random()*4);
            this.rotateAngle = random * 90;
        }else{
            var random = Math.floor(Math.random()*2);
            this.rotateAngle = random * 180;
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
        }else{
            let curOrder = this.order;
            let selectedBlockOrder = this.selectedBlock.order;
            this.setOrder(selectedBlockOrder);
            this.selectedBlock.setOrder(curOrder);
        }
    }

    this.rotate = function(angle){
        let piece = this.element.getElementsByClassName("piece")[0];
        this.rotateAngle = angle!=undefined ? angle : this.rotateAngle + (this.column==this.row ? 90 : 180);
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

        if(completeGame){
            // ie 不支持
            var evt = document.createEvent('Event');
            // 定义事件类型
            evt.initEvent('customComplete', true, false);
            document.body.dispatchEvent(evt);
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

 // 点击选中的拼图块
Block.prototype.selectedBlock = null;
 // 拖拽时在页面上移动的拼图块
Block.prototype.dragEvent = null;

