function GridMap(){
	this.map = {};
	this.objects = {};
	this.h=0;
	this.w=0;
	this.x=0;
	this.y=0;
	this.cellColorCode = {};
	this.drawSeparation = true;
}
GridMap.prototype.setSize = function(he,wi){
	this.h = he;
	this.w = wi;
}

GridMap.prototype.setObjectIn = function(obj,c,r){
	objects[c][r].push(obj);
}
GridMap.prototype.removeObjectIn = function(obj,c,r){
	for(var i=0;i<objects[c][r].length;i++){
		if(objects[c][r] == obj){
			objects[c][r].splice(i,1);
			break;
		}
	}
}
GridMap.prototype.getObjectsIn = function(obj,c,r){
	return objects[c][r];
}

GridMap.prototype.getXSize = function(){
	return this.w/this.map.length;
}

GridMap.prototype.getYSize = function(r){
	return this.h/this.map[r].length;
}

GridMap.prototype.getXYByCell = function (c,r){
	var xSpace = this.w/this.map.length;
	var ySpace = this.h/this.map[r].length;
	
	return {mx: xSpace*c,my: ySpace*r};
}

GridMap.prototype.getCellValue = function (c,r){
	return this.map[c][r];
}
	
GridMap.prototype.getCellByXY = function (x,y){
	var mx = -1;
	var my = -1;
	if(x>=0 && y>=0){
		mx = Math.floor(x/this.getXSize());
		if(mx < this.map.length && mx >= 0){
			my = Math.floor(y/this.getYSize(mx));
			if(my < this.map[mx].length && my >= 0)
				return {mx,my};
		}
	}
	mx = -1;
	my = -1;
	return {mx,my};
}

GridMap.prototype.setCellCount = function(x,y){
	this.map = new Array(x);
	this.objects = new Array(x);
	for(var	 i=0;i<y;i++){
		for(var j=0;j<y;j++){
			this.map[i] = new Array(y);
			this.map[i][j] =0;
			
			this.objects[i] = new Array(y);
			this.objects[i][j] =0;
		}
	}
}

GridMap.prototype.setCellValue = function(x,y,val){
	if(x<0 || x>=this.map.length || y<0 || y>=this.map[x].length)
		return;
	this.map[x][y] = val;
}

GridMap.prototype.setCellsValue = function(vals){//ADDS THE VALUE TO accx
	this.map = new Array(vals.length);
	for(var i=0;i<vals.length;i++){
		this.map[i] = new Array(vals[i].length);
		for(var j=0;j<vals[i].length;j++){
			this.map[i][j] = vals[i][j];
		}
	}
}

GridMap.prototype.setColorCode = function(code,color) {
	this.cellColorCode[code] = color;
}

GridMap.prototype.setColorCodes = function(codes,colors) {
	for(var i=0;i<codes.length;i++){
		this.cellColorCode[codes[i]] = colors[i];
	}
}

GridMap.prototype.draw = function(ctx) {
	var xSpace=this.w/this.map.length;
	var ySpace=0;
	var sepOfX = 0;
	var sepOfY = 0;
	if(!this.drawSeparation){
		sepOfX = 1;
		sepOfY = 1;
	}
	ctx.save();
	ctx.translate(this.x,this.y);
		for(var i=0;i<this.map.length;i++){
			for(var j=0;j<this.map[i].length;j++){
				ySpace = this.h/this.map[i].length;
				ctx.fillStyle = this.cellColorCode[this.map[i][j]];
				ctx.fillRect(xSpace*j,ySpace*i,xSpace+sepOfX,ySpace+sepOfY);
			}
		}
	ctx.restore();
}
GridMap.prototype.collisionInFront = function(obj,cellCodes){//obj = object that will collide; cellCodes: Vector with all the cells values that will trigger a collision
	var currentCell = this.getCellByXY(obj.x,obj.y);
	if(currentCell.mx<0 || currentCell.my<0)
		return false;
	var cellCmod = 0;
	if(obj.velx>0){
		cellCmod = 1;
	}else if(obj.velx<0){
		cellCmod = -1;
	}
	var cellRmod = 0;
	if(obj.vely>0){
		cellRmod = 1;
	}else if(obj.vely<0){
		cellRmod = -1;
	}
	var ahead;
	if(cellCmod !=0 || cellRmod !=0){
		//Checking in each extreme collision points		
		if(typeof obj.collisionPoints === "object"){
			for(var i =0;i<obj.collisionPoints.length;i++){
				currentCell = this.getCellByXY(obj.x+obj.collisionPoints[i].x,obj.y+obj.collisionPoints[i].y);
				ahead = this.getCellByXY((obj.x+obj.collisionPoints[i].x+obj.velx),(obj.y+obj.collisionPoints[i].y+obj.vely));	
				if(ahead.mx>=0 && ahead.my>=0){
					if(cellCodes.includes(this.map[ahead.my][ahead.mx])){
						return true;
					}
				}
			}
		}
		//Checking fron to center to the edge
		ahead = this.getCellByXY(((obj.x+(obj.w*cellCmod/2))+obj.velx),(obj.y+(obj.h*cellRmod/2)+obj.vely));
		if(ahead.mx>=0 && ahead.my>=0 && ahead.mx<this.map.length && ahead.my<this.map[0].length){
			if(cellCodes.includes(this.map[ahead.my][ahead.mx])){
				return true;
			}else{
				var current = this.getCellByXY((obj.x),(obj.y));
				var aheadX = {mx:ahead.mx,my:current.my};
				var aheadY = {mx:current.mx,my:ahead.my};
				return ((cellCodes.includes(this.map[aheadX.my][aheadX.mx])) && (cellCodes.includes(this.map[aheadY.my][aheadY.mx])));
			}
		}
	}
	return false;
}