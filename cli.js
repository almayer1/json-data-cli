#!/usr/bin/env node

const { Command } = require('commander');
const fs            = require('fs');
const path          = require('path');
const csvParser = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const JSON_FILE = path.resolve(__dirname, 'data.json');
const CSV_FILE = path.resolve(__dirname, 'data.csv');

const program = new Command();
program.name('mycli');
program.description('A simple JSON CLI');
program.version('1.0.0');

function loadJson() {
    //if file doesn't exist return empty array
    if (!fs.existsSync(JSON_FILE)) {
        return [];
    }
    //extracts info from file
    const raw = fs.readFileSync(JSON_FILE, 'utf8');
    //returns an JS style array
    return JSON.parse(raw);
}
function saveJson(data) {
    const text = JSON.stringify(data, null, 2);
    fs.writeFileSync(JSON_FILE, text);
}
function loadCsv() {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(CSV_FILE)) {
            return resolve([]);
        }
        const results = [];
        fs.createReadStream(CSV_FILE)
        .pipe(csvParser())
        .on('data', row => results.push(row))
        .on('end', () => resolve(results))
        .on('error', err => rejects(err));
    });
}
function saveCsv(data) {
    
}

//add
program
    .command('add <name> [description]')
    .description('Add a new item to your JSON data')
    .option('-t, --tags <tags…>', 'comma-separated tags')
    .action((name, description, options) => {
        //array of already load items
        const items = loadJson();
        const newItem = {
            name, 
            description: description || '',
            tags: options.tags?.split(',') || []
        }
        items.push(newItem);
        saveJson(items);
        console.log(`Added ${name} successfully`);
    });

//remove
program
    .command('remove <name>')
    .description('Remove an item by name')
    .action((name) => {
        const items = loadJson();
        let isFound = false;
        for (let i = 0; i < items.length; i++) {
            if (items[i].name === name) {
                items.splice(i, 1);
                isFound = true;
                break;
            } 
        }
        saveJson(items);
        if (isFound) {
            console.log(`Removed ${name} successfully`);
        }
        else {
            console.log(`Error... couldn't remove ${name}`);
        }
    });

//list
program 
    .command('list')
    .description('Lists out all items')
    .action(() => {
        const items = loadJson();
        for (let i = 0; i < items.length; i++) {
            let line = `${i + 1}. ${items[i].name}`;
            if (items[i].description) {
                line += ` - ${items[i].description}`;
            }
            if (items[i].tags.length != 0) {
                line += ` (tags: ${items[i].tags.join(', ')})`;
            }
            console.log(line);
        }
    });
program.parse(process.argv);

