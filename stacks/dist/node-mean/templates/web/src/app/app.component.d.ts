import { OnInit } from "@angular/core";
interface MeanItem {
    name: string;
    done: boolean;
}
export declare class AppComponent implements OnInit {
    items: MeanItem[];
    status: string;
    ngOnInit(): Promise<void>;
}
export {};
