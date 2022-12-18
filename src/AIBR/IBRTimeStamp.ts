export class IBRTimeStamp{
    _date!:Date;
    static FromDictCOLMAP(d:{[name:string]:any}) {
        let ts = new IBRTimeStamp();
        ts._date =new Date(d['year'], d['month'],d['day'],d['hour'],d['minute'],d['second'],0);
        return ts;
    }

    static FromMilliseconds(time:number){
        let ts = new IBRTimeStamp();
        ts._date=new Date(time);
        return ts;
    }

    static FromString(dateString:string) {
        let ts = new IBRTimeStamp();
        ts._date = new Date(dateString);
        return ts;
    }

    get date(){
        // return Date.parse(`${this.year}-${this.month}-${this.day}T${this.hour}:${this.minute}:${this.second}`)
        return this._date;
        // return new Date(this.year, this.month,this.day,this.hour,this.minute,this.second,0);
    }

    get time(){
        return this.date.getTime();
    }

    getDaySeconds(){
        return this.date.getHours()*3600+this.date.getMinutes()*60+this.date.getSeconds();
    }


    // get absoluteDay(){
    //     return (this.year-2021)*365+this.month*31+this.day;
    // }

    constructor() {
        // this.year = year??-1;
        // this.month = month??-1;
        // this.day = day??-1;
        // this.minute = minute??-1;
        // this.second = second??-1;
        // this.timestamp = timestamp??-1;
    }
}
