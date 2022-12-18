export class IBRTimeStamp{
    // static Day0:number=7000;
    // timestamp!:number;
    // year!:number;
    // month!:number;
    // day!:number;
    // weekday!:number;
    // hour!:number;
    // minute!:number;
    // second!:number;
    _date!:Date;
    static FromDictCOLMAP(d:{[name:string]:any}) {
        let ts = new IBRTimeStamp();
        ts._date =new Date(d['year'], d['month'],d['day'],d['hour'],d['minute'],d['second'],0);

        // ts.year = d['year'];
        // ts.month = d['month'];
        // ts.day = d['day'];
        // ts.weekday = d['weekday'];
        // ts.hour = d['hour'];
        // ts.minute = d['minute'];
        // ts.second = d['second'];
        // ts.timestamp = d['timestamp'];
        // ts.day = d['day'];
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
        // ts.year = d['year'];
        // ts.month = d['month'];
        // ts.day = d['day'];
        // ts.weekday = d['weekday'];
        // ts.hour = d['hour'];
        // ts.minute = d['minute'];
        // ts.second = d['second'];
        // ts.timestamp = d['timestamp'];
        // ts.day = d['day'];
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
