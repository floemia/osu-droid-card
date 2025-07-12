export abstract class TimeHelper {

    static toMonthYear(date: Date) {
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        return `${month} ${year}`;
    }
    
}