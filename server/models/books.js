
export function getAbbreviation(bookTitle) { 
    console.log(`\n[System] Getting book: ${bookTitle}...`);
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
        Revelation: 'REV',
        'New Testament': 'nt',
        'Old Testament': 'ot',
        'Bible': 'all'
    }
    console.log(`\n[System] Found abbreviation: ${bookTitles[bookTitle]} for book: ${bookTitle}`);
    return bookTitles[bookTitle] ;
}

export async function getBookText(abbr,pageNumber) {
    console.log(`getting ${abbr}`)
    const parser = new PDFParse({ url: `https://ebible.org/pdf/eng-kjv2006/eng-kjv2006_${abbr}.pdf` });
    const text = await parser.getText({partial: [Number(pageNumber)]});
    parser.destroy();
    return text;
};

export async function getNumberOfPages(abbr) {
    console.log(`getting number of pages for ${abbr}`)
    const parser = new PDFParse({ url: `https://ebible.org/pdf/eng-kjv2006/eng-kjv2006_${abbr}.pdf` });
    const result = await parser.getInfo({ parsePageInfo: true }); 
    parser.destroy();
    return String(result.total)
}