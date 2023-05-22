import { AzureFunction, Context } from "@azure/functions"
import axios from 'axios';
import * as cheerio from 'cheerio';

interface MenuDataEntryInternal {
    weekday: string;
    text: string;
}

interface MenuDataInternal {
    menu: MenuDataEntryInternal[];
}

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    let response = await axios.get('https://www.mensen.at', {
        headers: {
            Cookie: 'mensenExtLocation=67'
        }
    });

    if (response.status === 200) {
        const html = response.data;
        const $ = cheerio.load(html);

        const menuData: MenuDataInternal = {
            menu: []
        };
        
        // Load the 'Tagesempfehlungen' from the HTML document
        $('#middleColumn .menu-plan .menu-item').each((index, element) => {
            const weekday = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"][index];
            const text = $(element).find("p").map((index, element) => {
                return $(element).text();
            }).toArray().join("\n");
            menuData.menu.push({
                weekday,
                text,
            });
        });
        
        context.log(menuData);
        // TODO: Send into queue
    }

};

export default timerTrigger;
