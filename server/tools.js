import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { PDFParse } from 'pdf-parse';
import { getBookPages } from "./models/books.js";

const BOOK_ABBREVIATION_DESCRIPTION = "All-caps abbreviation returned by get_abbreviation, e.g. MAT for Matthew.";
// Coerces numbers to strings automatically if the LLM forgets to pass a string literal
const flexiblePageNumberSchema = (maxPage) => z
  .union([z.string(), z.number()])
  .transform((val) => String(val))
  .describe(`The PDF page number to fetch. Must be a numeric value from "1" to "${maxPage}". Always start at "1" and increment sequentially.`);

export const getAbbreviation = tool(
    async ({ bookTitle }) => {
        console.log(`\n[System] Executing tool for book: ${bookTitle}...`);
        const bookTitles = {
            Genesis: 'GEN',
            Exodus: 'EXO',
            Leviticus: 'LEV',
            Numbers: 'NUM',
            Deuteronomy: 'DEU',
            Joshua: 'JOS',
            Judges: 'JDG',
            Ruth: 'RUT',
            '1 Samuel': '1SA',
            '2 Samuel': '2SA',
            '1 Kings': '1KI',
            '2 Kings': '2KI',
            '1 Chronicles': '1CH',
            '2 Chronicles': '2CH',
            Ezra: 'EZR',
            Nehemiah: 'NEH',
            Esther: 'EST',
            Job: 'JOB',
            Psalms: 'PSA',
            Proverbs: 'PRO',
            Ecclesiastes: 'ECC',
            'Song of Solomon': 'SNG',
            Isaiah: 'ISA',
            Jeremiah: 'JER',
            Lamentations: 'LAM',
            Ezekiel: 'EZK',
            Daniel: 'DAN',
            Hosea: 'HOS',
            Joel: 'JOL',
            Amos: 'AMO',
            Obadiah: 'OBA',
            Jonah: 'JON',
            Micah: 'MIC',
            Nahum: 'NAH',
            Habakkuk: 'HAB',
            Zephaniah: 'ZEP',
            Haggai: 'HAG',
            Zechariah: 'ZEC',
            Malachi: 'MAL',
            Matthew: 'MAT',
            Mark: 'MRK',
            Luke: 'LUK',
            John: 'JHN',
            Acts: 'ACT',
            Romans: 'ROM',
            '1 Corinthians': '1CO',
            '2 Corinthians': '2CO',
            Galatians: 'GAL',
            Ephesians: 'EPH',
            Philippians: 'PHP',
            Colossians: 'COL',
            '1 Thessalonians': '1TH',
            '2 Thessalonians': '2TH',
            '1 Timothy': '1TI',
            '2 Timothy': '2TI',
            Titus: 'TIT',
            Philemon: 'PHM',
            Hebrews: 'HEB',
            James: 'JAS',
            '1 Peter': '1PE',
            '2 Peter': '2PE',
            '1 John': '1JN',
            '2 John': '2JN',
            '3 John': '3JN',
            Jude: 'JUD',
            Revelation: 'REV'
        }
        console.log(`\n[System] Found abbreviation: ${bookTitles[bookTitle]} for book: ${bookTitle}`);
        return bookTitles[bookTitle] ;
    },
    {
        name: "get_abbreviation",
        description: "Get the official abbreviation for a Bible book.",
        schema: z.object({
            bookTitle: z.string().describe("Bible book name spelled out completely, e.g. Matthew.")
        }),
    }
);

export const getBookText = tool(
    async ({ abbr, pageNumber }) => {
        console.log(`getting ${abbr}`)
        const parser = new PDFParse({ url: `https://ebible.org/pdf/eng-kjv2006/eng-kjv2006_${abbr}.pdf` });
        const text = await parser.getText({partial: [Number(pageNumber)]});
        parser.destroy();
        return text;
    },
    {
        name: "get_book_text",
        description: "Get one PDF page from a specific Bible book using an abbreviation from get_abbreviation.",
        schema: z.object({
            abbr: z.string().describe(BOOK_ABBREVIATION_DESCRIPTION),
            pageNumber: z.union([z.string(), z.number()]).transform(val => String(val)).describe("PDF page number as a numeric string; start at \"1\" and increment as needed.")
        }),
    }
);

export const getNumberOfPages = tool(
    async ({ abbr }) => {
        console.log(`getting number of pages for ${abbr}`)
        const parser = new PDFParse({ url: `https://ebible.org/pdf/eng-kjv2006/eng-kjv2006_${abbr}.pdf` });
        const result = await parser.getInfo({ parsePageInfo: true }); 
        parser.destroy();
        return String(result.total)
    },
    {
        name: "get_number_of_pages",
        description: "Get the total PDF page count for a specific Bible book.",
        schema: z.object({
            abbr: z.string().describe(BOOK_ABBREVIATION_DESCRIPTION)
        }),
    }
);

export const getAllNewTestament = tool(
    //479 pages
    async ({pageNumber}) => {
        const numericPageNumber = Number(pageNumber);
        if (numericPageNumber < 1 || numericPageNumber > 479) {
            throw new Error("Page number must be between 1 and 479 for the New Testament.");
        }
        console.log(`getting all new testament books`)
        const parser = new PDFParse({ url: `https://ebible.org/pdf/eng-kjv2006/eng-kjv2006_nt.pdf` });
        const page = await parser.getText({partial: [numericPageNumber]});
        parser.destroy();
        return page;
    },
    {
        name: "get_all_new_testament",
        description: "Broad search only when the specific Bible book is unknown; get one PDF page from the New Testament.",
        schema: z.object({
            pageNumber: flexiblePageNumberSchema(479) 
        }),
    }
);

export const getOldTestament = tool(
    //1107 pages
    async ({pageNumber}) => {
        const numericPageNumber = Number(pageNumber);
        if (numericPageNumber < 1 || numericPageNumber > 1107) {
            throw new Error("Page number must be between 1 and 1107 for the Old Testament.");
        }
        console.log(`getting all old testament books`)
        const parser = new PDFParse({ url: `https://ebible.org/pdf/eng-kjv2006/eng-kjv2006_all.pdf` });
        const page = await parser.getText({partial: [numericPageNumber]});
        parser.destroy();
        return page;
    },
    {
        name: "get_old_testament",
        description: "Broad search only when the specific Bible book is unknown; get one PDF page from the Old Testament.",
        schema: z.object({
            pageNumber: flexiblePageNumberSchema(1107)
        }),
    }
);

export const getAllBible = tool(
    //1473 bible
    async ({pageNumber}) => {
        const numericPageNumber = Number(pageNumber);
        if (numericPageNumber < 1 || numericPageNumber > 1473) {
            throw new Error("Page number must be between 1 and 1473 for the entire Bible.");
        }
        console.log(`getting all books in the bible`)
        const parser = new PDFParse({ url: `https://ebible.org/pdf/eng-kjv2006/eng-kjv2006_all.pdf` });
        const page = await parser.getText({partial: [numericPageNumber]});
        parser.destroy();
        return page;
    },
    {
        name: "get_all_bible",
        description: "Broad search only when the specific Bible book is unknown; get one PDF page from the entire Bible.",
        schema: z.object({pageNumber: flexiblePageNumberSchema(1473)}),
    }


);
const MAX_PAGES_PER_SEARCH = 4;
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Lowercase letters only, so verse numbers, line breaks and punctuation don't affect quote checks
const normalizeText = (text) => text.toLowerCase().replace(/[^a-z]+/g, " ").trim();

// Creates the tools for one search request. The match finder saves matches and the match comparer chooses one.
export function createMatchTools(abbr) {
    const matches = [];
    const selection = { match: null, explanation: "" };
    const shownPages = new Set();
    let bookPages;

    const getMatchingPages = tool(
        async ({ keyword }) => {
            console.log(`\n[System] Searching ${abbr} for: ${keyword}`);
            bookPages ??= await getBookPages(abbr);
            const pattern = new RegExp(`\\b${escapeRegExp(keyword.trim())}\\b`, "i");
            const foundPages = bookPages.filter((page) => pattern.test(page.text));
            if (foundPages.length === 0) {
                return `No pages contain "${keyword}". Try a different word or phrase.`;
            }
            const newPages = foundPages.filter((page) => !shownPages.has(page.num));
            if (newPages.length === 0) {
                return `Every page containing "${keyword}" was already shown earlier.`;
            }
            if (newPages.length > MAX_PAGES_PER_SEARCH) {
                return `"${keyword}" appears on ${newPages.length} pages, which is too many. Try a more specific word or phrase.`;
            }
            newPages.forEach((page) => shownPages.add(page.num));
            console.log(`[System] "${keyword}" found on pages: ${newPages.map((page) => page.num).join(", ")}`);
            return newPages.map((page) => `--- Page ${page.num} ---\n${page.text}`).join("\n\n");
        },
        {
            name: "get_matching_pages",
            description: "Search the Bible book for a word or short phrase and return the text of every page that contains it.",
            schema: z.object({
                keyword: z.string().describe("A word or short phrase likely to appear in the verse, e.g. \"vine\" or \"living bread\".")
            }),
        }
    );

    const saveMatch = tool(
        async ({ pageNumber, reference, quote, reason }) => {
            const page = bookPages?.find((bookPage) => bookPage.num === pageNumber);
            if (!page || !shownPages.has(page.num)) {
                return `Page ${pageNumber} has not been returned by get_matching_pages. Only save verses from pages you have been shown.`;
            }
            if (/\.\.\.|…/.test(quote)) {
                return `Do not shorten the quote with "...". Copy the whole verse exactly as it appears on page ${pageNumber} and try again.`;
            }
            if (!normalizeText(page.text).includes(normalizeText(quote))) {
                return `That quote was not found on page ${pageNumber}. Copy the verse text exactly as it appears on the page and try again.`;
            }
            matches.push({ pageNumber, reference, quote, reason });
            console.log(`\n[System] Saved match ${matches.length}: ${reference}`);
            return `Saved match ${matches.length}: ${reference}`;
        },
        {
            name: "save_match",
            description: "Save a verse that matches the user's request so it can be compared with the other matches.",
            schema: z.object({
                pageNumber: z.union([z.string(), z.number()]).transform((val) => Number(val)).describe("The page number the verse was found on."),
                reference: z.string().describe("The verse reference, e.g. John 15:1."),
                quote: z.string().min(10).describe("The whole verse copied exactly as it appears on the page, without shortening."),
                reason: z.string().describe("One short sentence on why this verse matches the user's request.")
            }),
        }
    );

    const loadMatches = tool(
        async () => matches.length > 0
            ? JSON.stringify(matches.map((match, index) => ({ matchNumber: index + 1, ...match })), null, 2)
            : "No matches were saved.",
        {
            name: "load_matches",
            description: "Load every verse saved as a possible match for the user's request.",
            schema: z.object({}),
        }
    );

    const chooseMatch = tool(
        async ({ matchNumber, explanation }) => {
            const match = matches[matchNumber - 1];
            if (!match) {
                return `There is no match number ${matchNumber}. Choose a matchNumber from load_matches.`;
            }
            selection.match = match;
            selection.explanation = explanation;
            console.log(`\n[System] Chose match ${matchNumber}: ${match.reference}`);
            return `Chose match ${matchNumber}: ${match.reference}`;
        },
        {
            name: "choose_match",
            description: "Choose the saved match that best answers the user's request.",
            schema: z.object({
                matchNumber: z.union([z.string(), z.number()]).transform((val) => Number(val)).describe("The matchNumber from load_matches."),
                explanation: z.string().describe("One sentence explaining why this verse answers the user's question.")
            }),
        }
    );

    return { matches, selection, finderTools: [getMatchingPages, saveMatch], comparerTools: [loadMatches, chooseMatch] };
}
