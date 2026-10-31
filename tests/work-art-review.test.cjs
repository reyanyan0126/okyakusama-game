"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const page=fs.readFileSync(path.join(__dirname,"..","work-art-review.html"),"utf8");
const importer=fs.readFileSync(path.join(__dirname,"..","scripts/import-work-sprites.py"),"utf8");
test("gallery matches importer categories and 132 cells",()=>{
 for(const [id,cols,rows] of [["customers",8,5],["scenes",4,3],["icons",8,4],["special-customers",4,4],["expressions",8,4]]){
  assert.match(page,new RegExp('\\["'+id+'","[^"]+",'+cols+','+rows+'\\]'));
  assert.ok(importer.includes('"'+id+'":'));
 }
 assert.equal(40+12+32+16+32,132);
});
test("review does not silently treat missing assets as approved",()=>{
 assert.match(page,/img\.onerror/);
 assert.match(page,/未配置/);
 assert.match(page,/未審査/);
 assert.match(importer,/review-required/);
});
