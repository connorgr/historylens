    function getData() {
        console.log("getting data from php...");
        var result;
        var filterJSON = JSON.stringify({min_latitude: -45, max_latitude: 45, min_longitude: -45, max_longitude: 45, min_year: 2005, max_year: 2005});
        $.get("/vs/php/query.php",
                {"q" : filterJSON},
                function(data, status) {
                    console.log(data);
                    console.log(status);
                    result = $.parseJSON(data);
                },
                'json')
         .success(function(data) { console.log("success"); })
         .error(function(e) { console.log("error"); console.log(e); console.log(e.responseText); result = $.parseJSON(e.responseText); });

         console.log(result);
        
/*        var string = '{"map":{"":{"lat":"8.50587500000","long":"17.58165500000","topics":{"":"8","Chile":"1","Climatic changes":"1","Climatology":"1","Global temperature changes":"1","Government relations":"1","Greenhouse effect, Atmospheric":"1","History":"1","Land grants":"1","Land reform":"1","Land tenure":"1","Mapuche Indians":"1","Politics and government":"1","Race relations":"1","Social conditions":"1"}},"00":{"lat":"-0.37500000000","long":"29.87500000000","topics":{"":"8"}},"01":{"lat":"-0.75000000000","long":"37.00000000000","topics":{"":"1"}},"02":{"lat":"-29.42895000000","long":"30.51460000000","topics":{"":"2"}},"05":{"lat":"-33.01529000000","long":"27.91162000000","topics":{"":"1"}},"06":{"lat":"-2.40075666667","long":"8.68121000000","topics":{"":"3","Climatic changes":"1","Climatology":"1","Global temperature changes":"1","Greenhouse effect, Atmospheric":"1"}},"07":{"lat":"41.89474000000","long":"12.48390000000","topics":{"":"1"}},"09":{"lat":"0.50000000000","long":"34.58333000000","topics":{"":"3"}},"11":{"lat":"-33.96300000000","long":"22.46173000000","topics":{"":"5"}},"24":{"lat":"6.13748000000","long":"1.21227000000","topics":{"":"1"}}},"timeline":{"2005":{"":"33","Chile":"1","Climatic changes":"2","Climatology":"2","Global temperature changes":"2","Government relations":"1","Greenhouse effect, Atmospheric":"2","History":"1","Land grants":"1","Land reform":"1","Land tenure":"1","Mapuche Indians":"1","Politics and government":"1","Race relations":"1","Social conditions":"1"}},"document":[{"title":"Strangers, Spirits, and Land Reforms: Conflicts about Land in Dande, Northern Zimbabwe","pubYear":"2005","url":"http:\/\/zotero.org\/groups\/50280\/items\/R9RAB5QM"},{"title":"In pursuit of land tenure security : essays on land reform and land tenure","pubYear":"2005","url":"http:\/\/zotero.org\/groups\/50280\/items\/UGZHAXHG"},{"title":"Building modern land administration systems in developed economies","pubYear":"2005","url":"http:\/\/zotero.org\/groups\/50280\/items\/VEGQMQQK"},{"title":"The Realtors Go To Washington: Establishing Homeownership","pubYear":"2005","url":"http:\/\/zotero.org\/groups\/50280\/items\/42NNXI97"},{"title":"null","pubYear":"2005","url":"http:\/\/zotero.org\/groups\/50280\/items\/99Z6EUVG"},{"title":"East End immigrants and the battle for housing: a comparative study of political mobilisation in the Jewish and Bengali communities","pubYear":"2005","url":"http:\/\/zotero.org\/groups\/50280\/items\/RAIRPTPK"},{"title":"Young America: Land, Labor, and the Republican Community","pubYear":"2005","url":"http:\/\/zotero.org\/groups\/50280\/items\/JMFGTJMG"},{"title":"Treaties, Intellectual Property, Market Power, and Food in the Developing World","pubYear":"2005","url":"http:\/\/zotero.org\/groups\/50280\/items\/C5KVTTE8"},{"title":"The State, Land System, and Land Development Processes in Contemporary China","pubYear":"2005","url":"http:\/\/zotero.org\/groups\/50280\/items\/KGNTIB97"},{"title":"The Problem of the Epoch? Labour and Housing, 191851","pubYear":"2005","url":"http:\/\/zotero.org\/groups\/50280\/items\/XZSCV4P6"},{"title":"Plows, Plagues, and Petroleum: How Humans Took Control of Climate","pubYear":"2005","url":"http:\/\/zotero.org\/groups\/50280\/items\/23A3FHVX"},{"title":"Faulty Shades of Green","pubYear":"2005","url":"http:\/\/zotero.org\/groups\/50280\/items\/3QGXIK87"},{"title":"The transformation of property rights in Kenyas Maasailand: Triggers and motivations","pubYear":"2005","url":"http:\/\/zotero.org\/groups\/50280\/items\/63T9QQHM"},{"title":"The Manchester Rambler: Ewan MacColl and the 1932 Mass Trespass","pubYear":"2005","url":"http:\/\/zotero.org\/groups\/50280\/items\/TET45Q52"},{"title":"The state, land system, and land development processes in contemporary China","pubYear":"2005","url":"http:\/\/zotero.org\/groups\/50280\/items\/ETBXTK34"}]}'; */
        
    }

