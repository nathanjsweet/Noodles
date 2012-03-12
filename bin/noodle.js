(function(){
    'use strict';
    /*
        To Do:
        1.boolean needs greater than and less than
    */
    var reBoolean = /(?:\s*)(\!?)([^\!\=]*)(\!?)(?:\=*)(.*)/,
    
    reExpression = /^([^\s\}]+)(.*)/,
    
    reIsObject = /^\s*<{1}[^>]+>{1}\s*/,
    
    reObjectParser = /(?:\[|\.)?([^\[\]\.]+)(?:\])?(.*)/,
    
    reIf = /<\{if /i,
    
    reElse = /<\{else(\}>| )/i,
    
    reEndIf = /<\{endif(\}>| )/i,
    
    reIsNum = /^\d+$/,
    
    Noodles = function(obj){
        this.context = obj.context;
        this.string = this._postAccumulation = obj.string;
        this._ERROR_REPORTING = obj.ERROR_REPORTING;
        this._onRender = obj.onRender;
        this._preAccumulation = '';
        this._rightCount = 0;
        this._leftCount = 0;
        this._save = this.save();
        this._errors = '';
        this.resume();
        
    };
    
    
    
    Noodles.prototype.resume = function(){
        this._rendering = true;
        while(this._rendering){
            try{
                this.evaluate();
            } catch(e){
                this.error(e);
            }
        }
    };
    
    Noodles.prototype.pause = function(){
        this._rendering = false;
    };
    
    Noodles.prototype.end = function(){
        
        if(typeof this._onRender === 'function'){
            this._save(this._errors);
            this.string = this._preAccumulation + this._errors;
        } else{
            this.string = this._errors + this._preAccumulation;
        }
    };
    
    Noodles.prototype.error = function(e){
        if(this._ERROR_REPORTING){
            
            var lineCount = 0,
                brace = this._rightCount > this._leftCount ? '}>' : '<{',
                count = Math.max(this._rightCount, this._leftCount),
                braceIndex = -1,
                lineIndex = 0;
                
            while(count > 0){
                braceIndex = this.string.indexOf(brace,braceIndex+1);
                count--;
            }
            
            if(braceIndex === -1) braceIndex = this.string.lastIndexOf(brace);
            
            while(braceIndex > lineIndex && lineIndex > -1){
                lineIndex = this.string.indexOf('\n',lineIndex+1);
                lineCount++;
            }
            lineCount = lineCount > 0 ? lineCount : 1;
            this._errors += e+' -  on line '+lineCount+'\n\n\r';
        }
    };
    
    Noodles.prototype.save = function(){
        return typeof this._onRender === 'function' ?
        function(string){
            this._onRender(string);
            this._preAccumulation += string;
        }
        :
        function(string){
            this._preAccumulation += string;
        };
    };

    Noodles.prototype.braceCount = function(string){
        var left = string.indexOf('<{'),
            right = string.indexOf('}>'),
            lCount = 0,
            rCount = 0;
            
        while(left > -1){
            lCount++;
            left = string.indexOf('<{',left+1);
        }
        
        while(right > -1){
            rCount++;
            right = string.indexOf('}>',right+1);
        }
        
        this._rightCount += rCount;
        this._leftCount += lCount;
    };
    
    Noodles.prototype.evaluate = function(){
        var leftIndex = this._postAccumulation.indexOf('<{'),
            rightIndex = this._postAccumulation.indexOf('}>'),
            operator, expression,whiteIndex;
        if(leftIndex > -1){
            this._leftCount++;
            
            if(rightIndex > -1){
                this._rightCount++;
                
                expression = this._postAccumulation.slice(leftIndex + 2, rightIndex);
            
                this._save(this._postAccumulation.slice(0,leftIndex));
                this._postAccumulation = this._postAccumulation.slice(rightIndex+2);

                if(expression.charAt(0) === ' ') throw 'Invalid whitespace at the start of expression';
                
                expression = reExpression.exec(expression);
                operator = expression[1];
                expression = expression[2];
                if(this.expressionHandlers[operator]){
                    
                    this.expressionHandlers[operator].call(this,expression.toLowerCase(),expression);
                } else{
                    this._save(this.objectHandler(operator.toLowerCase(),true));
                }
                
                
            } else{
                throw 'Open ended expression';
            }
        } else{
            this._save(this._postAccumulation);
            //stop rendering
            this._rendering = false;
            this.end();
        }
    };
    
    Noodles.prototype.objectHandler = function(key,bypass){
        var obj = this.context,
        parsed,keys,keyindex,tmp,isArray;
        if(reIsObject.test(key) || bypass){
            key = bypass ? key.trim() : key.slice(key.indexOf('<') + 1, key.indexOf('>')).trim();
            do{
                parsed = reObjectParser.exec(key);
                tmp = parsed[1];
                isArray = Array.isArray(obj);
                tmp = isArray ? parseInt(tmp,10) : tmp;
                if(obj[tmp]){
                    obj = obj[tmp];
                } else{
                    
                    if(isArray && isNaN(tmp)){
                        throw 'Object is an array, an integer must be passed as an accessor';
                    } else if(!isArray){
                        keys = ',' + Object.keys(obj).join()+ ',';
                        keyindex = keys.toLowerCase().indexOf(',' + tmp +',');
                        if(keyindex > -1){
                            obj = obj[keys.slice(keyindex + 1, keyindex + 1 + tmp.length)];
                        } else{
                            return '';
                        }
                    } else{
                        return '';
                    }
                    
                }
                key = parsed[2];
            } while(key);
            
            return !!obj ? obj : ' ';
                
        } else {
            return this.stringParser(key);
        }
    };
    
    Noodles.prototype.stringParser = function(string){
        string = string.trim();
        var first = string.charAt(0),
            length = string.length,
            last = string.charAt(length - 1),
            delimited = first === "'" || first === '"';
            
        if(delimited && first === last){
            return string.slice(1,length - 1);
        } else if(delimited && first !== last){
            throw 'Bad string syntax, improperly delimited';
        } else {
            return string;
        }
    };
    
    Noodles.prototype.goToIfEnd = function(){
        var count = 1,
            next = 0,
            MAX_VALUE = Number.MAX_VALUE,
            nextEnd,nextElse,nextIf,index;
            this._postAccumulation = '}>'+this._postAccumulation;
            
        while(count > 0){
            index = this._postAccumulation.indexOf('}>',next);

            if(this._ERROR_REPORTING) this.braceCount(this._postAccumulation.slice(0,index));
            this._postAccumulation = this._postAccumulation.slice(index+2);
        
            nextEnd = this._postAccumulation.search(reEndIf);
            if(nextEnd === -1) throw 'IF command not ended properly';
            if(count !== 1){
                nextElse = MAX_VALUE;
            } else{
                nextElse = this._postAccumulation.search(reElse);
                nextElse = nextElse > -1 ? nextElse : MAX_VALUE;
            }
            next = Math.min(nextEnd,nextElse);
            nextIf = this._postAccumulation.search(reIf);
            nextIf = nextIf > -1 ? nextIf : MAX_VALUE;
            if(next < nextIf){
                count--;
                next++;
            } else {
                count++;
                next = nextIf+1;
            }
        }
        this._postAccumulation = this._postAccumulation.slice(this._postAccumulation.indexOf('}>',next)+2);
    };
    
    Noodles.prototype.goToEnd = function(str,num){
        var count = 1,
            nextEnd = 0,
            reNextStrEnd = new RegExp('<\\{end' + str + '(\\}>| )','i'),
            reNextStr = new RegExp('<\\{' + str + '( |\\}>)','i'),
            MAX_VALUE = Number.MAX_VALUE,
            string = '}>'+this._postAccumulation,
            nextStr,index,next;
            
        while(count > 0){
            index = string.indexOf('}>',next);

            if(this._ERROR_REPORTING) this.braceCount(string.slice(0,index));
            
            string = string.slice(index+2);
            nextEnd = string.search(reNextStrEnd);
            if(nextEnd === -1) throw str+' command not ended properly';
            nextStr = string.search(reNextStr);
            nextStr = nextStr > -1 ? nextStr : MAX_VALUE;
            next = nextEnd;
            if(next < nextStr){
                count--;
                next++;
            } else {
                count++;
                next = nextStr + 1;
            }
        }
        
        if(num){
            return next;
        } else{
            this._postAccumulation = this._postAccumulation.slice(this._postAccumulation.indexOf('}>',next)+2);
        }
    };
    
    Noodles.prototype.expressionHandlers = {
        
        'if': function(expr){
            var expressions = expr.toLowerCase().split(' or '),
            exLength = expressions.length,
            exI = 0,
            subI,subLength,subExpressions,bool,tmp;
            
            while(exI < exLength){
                subExpressions = expressions[exI].split(' and ');
                subLength = subExpressions.length;
                subI = 0;
                
                while(subI < subLength){
                    bool = reBoolean.exec(subExpressions[subI]);
                    tmp = bool[4] ? this.objectHandler(bool[2],true) == this.objectHandler(bool[4]) : !!this.objectHandler(bool[2],true);
                    if( (bool[1]+bool[3]).length === 1 ) tmp = !tmp;
                    subExpressions[subI] = tmp ? '1' : '0';
                    subI++;
                }
                expressions[exI] = subExpressions.join('').indexOf('0') > -1 ? '0' : '1';
                exI++;
            }
            if(parseInt(expressions.join(''),10) === 0) this.goToIfEnd();
        },
        
        'else':function(expr){
            this.goToIfEnd();
        },
        
        'endif':function(){},
        
        'loop': function(expr){
            expr = expr.split(' as ');
            var obj = this.objectHandler(expr[0],true),
                asKey = expr[1] ? expr[1].trim().toLowerCase() : false,
                trueObj = !!obj,
                end = this.goToEnd('loop',trueObj);
            if(trueObj){
                var string = this._postAccumulation.slice(0,end-1),
                    keys = Object.keys(obj),
                    i = 0,
                    l = keys.length,
                    key,noodle;
                if(asKey){
                    while(i < l){
                        key = keys[i];
                        this.context.key = key;
                        this.context.value = this.context[asKey] = obj[key];
                        noodle = new Noodles({
                            string:string,
                            context:this.context,
                            ERROR_REPORTING: this._ERROR_REPORTING
                        }); 
                        this._save(noodle._preAccumulation);
                        if(noodle._errors) throw 'Error inside loop';
                        i++;
                    }
                    delete this.context[asKey];
                } else{
                    while(i < l){
                        key = keys[i];
                        this.context.key = key;
                        this.context.value = obj[key];
                        noodle = new Noodles({
                            string:string,
                            context:this.context,
                            ERROR_REPORTING: this._ERROR_REPORTING
                        }); 
                        this._save(noodle._preAccumulation);
                        if(noodle._errors) throw 'Error inside loop';
                        i++;
                    }
                }
                delete this.context.name;
                delete this.context.value;
                this._postAccumulation = this._postAccumulation.slice(this._postAccumulation.indexOf('}>',end)+2);
            }
        }
    };
    var microtime = require('microtime');
    var time = microtime.now();
    var myTemp = new Noodles({
        string:'<{if something[1] == bar}> and a \nasdfasd bunch more stuff\n<{else}> a bunch of stuff \n<{endif}>\n <{if something}>sdfasd\n <{endif}><{loop obj}> \n<{key}>:<{value}> <{endloop}>',
        context:{
            Something:['foo','bar'],
            nothing:'bar',
            obj:{
              'a':'b',
              'c':'d',
              'e':'f',
              'g':'h',
              'i':'j',
              'K':'L'  
            }
        },
        ERROR_REPORTING:true
    });
    time = microtime.now() - time;
    console.log(myTemp.string,'rendered in :',time,'microseconds');
    
}());