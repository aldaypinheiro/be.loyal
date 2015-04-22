/**
 * @author pravesh
 */
var db;
window.addEventListener('load', function(){
	createDB({'dbname':'be.loyal', 'dbversion':'1.0'});
	var lc = {'tablename':'loyalty.card', 'fields':{'id':'int(10) primary key', 'company':'text not null', 'description':'text not null', 'result':'text not null', 'format':'text not null'}};
	var c = {'tablename':'coupon', 'fields':{'id':'int(10) primary key', 'company':'text not null', 'description':'text not null', 'additional':'text not null', 'result':'text not null', 'format':'text not null'}};
	
	createTable(lc);
	createTable(c);
	//insert({'tablename':'mytable', 'values':{'firstname':"'pravesh'", 'lastname':"'kumar'"}});
	//select({'tablename':'mytable', 'where':{'id':'1'}});
	//select({'tablename':'mytable', 'where':{'firstname':"'pravesh'", 'lastname':"'kumar'"}});	
	//select({'tablename':'mytable'});
	//select({'tablename':'mytable', 'where':'id == 1'});
	//update({'tablename':'mytable', 'update':{'firstname':"'ajay'", 'lastname':"'kumar'"}, 'where':{'id':'2', 'lastname':"'singh'"}});
	//update({'tablename':'mytable', 'update':{'firstname':"'pravesh'", 'lastname':"'kumar'"}, 'where':{'id':'2'}});
	//update({'tablename':'mytable', 'update':{'firstname':"'ajay'"}, 'where':{'id':'2'}});
	//deleteD({'tablename':'mytable', 'where':{'firstname':"'ajay'"}});
	//rawQuery("Select * from mytable");
	//rawQuery("Insert into mytable (firstname, lastname) values('ajay','singh')");
});

function sqlSuccess(tx, result){
	console.log("sqlSuccess : is ");
	console.log(result);
	for(var i = 0; i < result.rows.length; i++) {
			    var data = result.rows.item(i);
			    console.log(data);			    
	}
	
}
function sqlError(tx, result){
	console.log("sqlError : ");
	console.log(result);
}
function rawQuery(sql){
	db.transaction(function (tx) { tx.executeSql(sql,[], sqlSuccess, sqlError);});
}
function deleteD(s){
	var tablename, where='';
	for(var i in s){
		if(i=='tablename'){
			tablename = s[i];
		}else if(i=='where'){
			for(var j in s[i]){
				where += j +' == '+s[i][j];				
			}		
		}
	}
	var sql = "DELETE FROM "+tablename+" WHERE "+where;
	db.transaction(function (tx) { tx.executeSql(sql,[], sqlSuccess, sqlError);});
}
function update(s){
	var tablename, fields;
	var updateTo = '', where = '';
	for(var i in s){
		if (i == 'tablename') {
			tablename = s[i];				
		}else if (i == 'update') {
			fields = looper(s[i]);
			var count = fields[2];
			for (var x=0; x<fields[2];x++) {
				if(count>1)
					updateTo += fields[0][x]+' = '+fields[1][x]+', ';
				else
					updateTo += fields[0][x]+' = '+fields[1][x];			
				count--;
			}
		}else if (i == 'where') {
			fields = looper(s[i]);
			var count = fields[2];
			for (var x=0; x<fields[2];x++) {
				if(count>1)
					where += fields[0][x]+' = '+fields[1][x]+' AND ';
				else
					where += fields[0][x]+' = '+fields[1][x];			
				count--;
			}						
		}
	}//end for loop
	var sql = "UPDATE "+tablename+" SET "+updateTo+" WHERE "+where;
	db.transaction(function (tx) { tx.executeSql(sql,[], sqlSuccess, sqlError);});
}


function select(s){
	var tablename, isWhere, isWhereS, fields, values='';
	for(var i in s){
		if(i == 'tablename'){
			tablename = s[i];			
		}else if(i == 'where' && typeof s[i]=== 'object'){
			isWhere = true;
			fields = looper(s[i]);						
		}else if(i == 'where' && typeof s[i]=== 'string'){
			isWhereS = true;
			values = s[i];
		}		
	}
	//Condition for Object
	if(isWhere){
		count = fields[2];
		for(var j=0; j<fields[2];j++){
			if(count!=1){
				values += fields[0][j]+ ' == '+fields[1][j]+' AND ';
			}else{
				values += fields[0][j]+ ' == '+fields[1][j];
			}
			count--;						
		}	
	}	
	//console.log(values);
	if(isWhere || isWhereS){
		var sql = "SELECT * FROM "+tablename+ ' WHERE '+values;		
	}else{
		var sql = "SELECT * FROM "+tablename;			
	}
	console.log(sql);
		db.transaction(function (tx){ tx.executeSql(sql,[],function(tx, result){
			for(var i = 0; i < result.rows.length; i++) {
			    var data = result.rows.item(i);
			    console.log(data);			    
			}
		},sqlError); 
	});
}
function insert(s){
	try{
		var tablename, fields, values='';
		for(var i in s){
			if(i == 'tablename'){
				tablename = s[i];			
			}else if(i == 'values'){
				fields = looper(s[i]);				
			}
		}		
		var sql = 'INSERT INTO '+tablename+'('+String(fields[0])+') VALUES('+String(fields[1])+')';
		db.transaction(function (tx){ tx.executeSql(sql); });				
	}catch(err){
		console.log(err);
	}	
}
function createTable(s){
	var tablename, fields, values='';
	for(var i in s){
		if(i == 'tablename'){
			tablename = s[i];			
		}else if(i == 'fields'){
			fields = looper(s[i]);						
		}				
	}
	for(var i = 0; i<fields[2];i++){
		if(i==0){
			values = values +' '+ fields[0][i]+' '+fields[1][i]+'';
		}else{
			values = values +', '+ fields[0][i]+' '+fields[1][i]+'';			
		}
	}
	var sql = 'CREATE TABLE IF NOT EXISTS '+tablename+' ('+values+')';
	db.transaction(function (tx) {tx.executeSql(sql);});
}
/*
create Database is a function accept database parameters in json format
json must contain dbname as key and value, and dbversion as key and value in integer format
*/
function createDB(a){
	try{
		var dbname, dbversion;
		for(var i in a){
			if(i=='dbname'){
				dbname = a[i];
			}else if(i=='dbversion'){
				dbversion = a[i];
			}
		}	
		db = openDatabase(dbname, dbversion, 'DataBase', 2 * 1024 * 1024);
		console.log('Database Created');			
	}catch(err){
		console.log('Database Creation failed '+err);
	}
}
/*
 looper is a funtion that accept json information and return array
 contains keys array and values array and total count of json keys and values 
 **/
function looper(a){
	var keys=[];
	var values=[];
	var count=0;
	for(var i in a){
		keys[count]= i;
		values[count]= a[i];
		count++;
	}
	val =[keys, values, count];
	return val;
}