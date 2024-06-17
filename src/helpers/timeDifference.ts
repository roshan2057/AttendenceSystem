export class TimeCalculation {
    static async getTotal(time, t1, t2, t3, t4, total): Promise<string> {
        if (t1 === null && t2 === null && t3 === null && t4 === null) {
            total = time;
            t1 = time;
        } else if (t1 !== null && t2 === null && t3 === null && t4 === null) {
            t2 = time;
            total += time;
        } else if (t2 !== null && t3 === null && t4 === null) {
            t3 = time;
            total += time;
        } else if (t3 !== null && t4 === null) {
            t4 = time;
            total += time;
        }
        // You can continue this pattern for more conditions
    
        return "ok";
    }
    

    static async getBreak(t1, t2, t3, t4): Promise<string> {

        
        return "ok"
    }


}
