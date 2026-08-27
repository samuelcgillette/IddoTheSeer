# this is my project to test AI tools 

## Overview
This project is meant to be an AI assistant that helps me find scripture references. The user will give it a prompt and it will be able to find the scripture the user is thinking of or find scriptures on the subject the user requests.
It will not write talks for the user nor make lesson plans. It will only find scripture references from the King James Bible, the Book of Mormon, and the Pearl of Great Price. This is to help me find scriptures that I remember kinda what they say not exactly or I can not remember where they are. 

## Requirements
* client-server-ai-tool pipeline
* tools that get text for bible, BOM, and Pearl
* server handeling of AI call
* client handeling of server responses
* simple client UI

## AI behavior notes
* AI should never create lesson plans, or talks
* AI should never answer other questions that are not related to finding references. This means it should never give its interpretation of a scripture, answer a question, or provide opinions.
* AI should answer I do not know if it can not find a reference
* AI should be able to find multiple sources on a subject
* AI should be able to find scriptures that are similar to each other 
* To prevent my computer blowing up there should be a limit on num of references o algo

## unknowns 
* what to use for to get text.
    * store PDFS on the server and have a tool that gets the text for the AI
    * find a API or text of somekind
    * store in a database, tools inquire the database 

## answeres to unknonws
* going to use a PDF parser and a tool that uses the pdf parser
