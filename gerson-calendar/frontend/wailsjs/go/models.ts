export namespace database {
	
	export class Event {
	    id: number;
	    title: string;
	    // Go type: time
	    startDate: any;
	    // Go type: time
	    endDate: any;
	    description: string;
	    filePath: string;
	    fileName: string;
	    zoomLink: string;
	    reminderMinutes: number;
	    recurrenceType: string;
	    recurrenceInterval: number;
	    recurrenceEnd: string;
	    category: string;
	    color: string;
	    allDay: boolean;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Event(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.startDate = this.convertValues(source["startDate"], null);
	        this.endDate = this.convertValues(source["endDate"], null);
	        this.description = source["description"];
	        this.filePath = source["filePath"];
	        this.fileName = source["fileName"];
	        this.zoomLink = source["zoomLink"];
	        this.reminderMinutes = source["reminderMinutes"];
	        this.recurrenceType = source["recurrenceType"];
	        this.recurrenceInterval = source["recurrenceInterval"];
	        this.recurrenceEnd = source["recurrenceEnd"];
	        this.category = source["category"];
	        this.color = source["color"];
	        this.allDay = source["allDay"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace main {
	
	export class EventInput {
	    title: string;
	    startDate: string;
	    endDate: string;
	    description: string;
	    filePath: string;
	    zoomLink: string;
	    reminderMinutes: number;
	    recurrenceType: string;
	    recurrenceInterval: number;
	    recurrenceEnd: string;
	    category: string;
	    color: string;
	    allDay: boolean;
	
	    static createFrom(source: any = {}) {
	        return new EventInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.startDate = source["startDate"];
	        this.endDate = source["endDate"];
	        this.description = source["description"];
	        this.filePath = source["filePath"];
	        this.zoomLink = source["zoomLink"];
	        this.reminderMinutes = source["reminderMinutes"];
	        this.recurrenceType = source["recurrenceType"];
	        this.recurrenceInterval = source["recurrenceInterval"];
	        this.recurrenceEnd = source["recurrenceEnd"];
	        this.category = source["category"];
	        this.color = source["color"];
	        this.allDay = source["allDay"];
	    }
	}

}

