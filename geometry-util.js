class GeometryUtil{

    static pointToLineDistance(x, y, x1, y1, x2, y2) {

        var A = x - x1;
        var B = y - y1;
        var C = x2 - x1;
        var D = y2 - y1;

        var dot = A * C + B * D;
        var len_sq = C * C + D * D;
        var param = -1;
        if (len_sq !== 0) //in case of 0 length line
            param = dot / len_sq;

        var xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        }
        else if (param > 1) {
            xx = x2;
            yy = y2;
        }
        else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        var dx = x - xx;
        var dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static findClosestLineToPoint(point,lines){
        var shortestDistance = {
            distance : 1000,
            roadId : -1
        };
        for (var line in lines) {
            var tempDistance = this.pointToLineDistance(point.x,point.y,line.x1,line.y1,line.x2,line.y2);
            if (shortestDistance.distance > tempDistance){
                shortestDistance.distance = tempDistance;
                shortestDistance.roadId = line.ID;
            }
        }
        return shortestDistance;
    }


}

module.exports = GeometryUtil;
