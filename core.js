export const TOPICS={base:'Sistemas y valor posicional',conv:'Conversiones con decimal',group:'Agrupación de bits',sum:'Suma binaria',units:'Unidades de almacenamiento',ascii:'Código ASCII'};
export const PHASES=[{id:'diagnostico',name:'Diagnóstico',time:'0–10',minutes:10,desc:'Descubre qué ya sabes.',icon:'◎'},{id:'fundamentos',name:'Fundamentos',time:'10–35',minutes:25,desc:'Comprende las reglas esenciales.',icon:'▦'},{id:'procedimientos',name:'Procedimientos',time:'35–70',minutes:35,desc:'Convierte, suma y comprueba.',icon:'⇄'},{id:'tarjetas',name:'Memoria activa',time:'70–90',minutes:20,desc:'Recupera sin mirar la respuesta.',icon:'▱'},{id:'simulacro',name:'Simulacro',time:'90–110',minutes:20,desc:'25 preguntas. Ponlo a prueba.',icon:'✎'},{id:'repaso',name:'Repaso final',time:'110–120',minutes:10,desc:'Cierra tus errores pendientes.',icon:'↗'}];
export const digits='0123456789ABCDEF';
export function parseBase(value,base){const s=String(value).trim().toUpperCase(); if(![2,8,10,16].includes(base)||!s||![...s].every(c=>digits.indexOf(c)>=0&&digits.indexOf(c)<base))throw Error('Escribe solo dígitos válidos para la base '+base+'.');const n=parseInt(s,base);if(!Number.isSafeInteger(n)||n>1000000000)throw Error('Usa un entero entre 0 y 1 000 000 000.');return n;}
export function convert(value,from,to){return parseBase(value,Number(from)).toString(Number(to)).toUpperCase();}
export function equalAnswer(q,a){if(a===undefined||a===null||String(a).trim()==='')return false;if(q.type==='num'){try{return parseBase(a,q.base||10)===parseBase(q.answer,q.base||10);}catch{return false;}}return String(a).trim()===String(q.answer).trim();}
export function conversionSteps(value,from,to){from=Number(from);to=Number(to);const n=parseBase(value,from),s=String(value).trim().toUpperCase(),out=n.toString(to).toUpperCase();let steps=[];
 if(from===10){let v=n;do{const quotient=Math.floor(v/to),r=v%to;steps.push(`${v} ÷ ${to} = ${quotient}, residuo ${digits[r]}`);v=quotient;}while(v>0);steps.push(`Lee los residuos de abajo hacia arriba: ${out} (base ${to}).`);}
 else if(from===2&&[8,16].includes(to)){const size=to===8?3:4,padded=s.padStart(Math.ceil(s.length/size)*size,'0'),groups=padded.match(new RegExp('.{'+size+'}','g'));steps.push(`Agrupa desde la derecha en bloques de ${size} bits; completa con ceros a la izquierda.`);steps.push(groups.map(g=>`${g} → ${parseInt(g,2).toString(to).toUpperCase()}`).join(' · '));steps.push(`Une los dígitos: ${out} (base ${to}).`);}
 else if([8,16].includes(from)&&to===2){const size=from===8?3:4;steps.push(`Convierte cada dígito en exactamente ${size} bits.`);steps.push([...s].map(d=>`${d} → ${parseInt(d,from).toString(2).padStart(size,'0')}`).join(' · '));steps.push(`Une los grupos: ${out} (los ceros iniciales son opcionales).`);}
 else {steps.push(`Numera posiciones desde 0, empezando por la derecha.`);steps.push([...s].map((d,i)=>`${d}×${from}^${s.length-1-i}`).join(' + ')+` = ${n} decimal.`);if(to!==10)steps.push(...conversionSteps(String(n),10,to).steps);else steps.push(`Suma los valores posicionales: ${out}.`);}
 return {out,steps};}
export function sumSteps(values){const ns=values.map(v=>parseBase(v,2));const width=Math.max(...values.map(v=>String(v).length));let carry=0,steps=[];for(let i=0;i<width;i++){const col=values.map(v=>Number(String(v)[String(v).length-1-i]||0));const total=col.reduce((a,b)=>a+b,0)+carry;steps.push(`Columna ${i+1} (2^${i}): ${col.join(' + ')} + acarreo ${carry} = ${total}. Escribe ${total%2}; lleva ${Math.floor(total/2)}.`);carry=Math.floor(total/2);}if(carry)steps.push(`Escribe el acarreo restante a la izquierda: ${carry.toString(2)}.`);const total=ns.reduce((a,b)=>a+b,0);steps.push(`Comprobación decimal: ${ns.join(' + ')} = ${total}. Resultado: ${total.toString(2)}₂.`);return{out:total.toString(2),steps};}
export function mastery(attempts,topic){const a=attempts.filter(a=>a.topic===topic).slice(-12);return a.length?Math.round(100*a.filter(a=>a.ok).length/a.length):null;}
export function level(attempts,topic){const a=attempts.filter(a=>a.topic===topic);const m=mastery(attempts,topic);return a.length<2?1:m>=80&&a.length>=3?3:m>=50?2:1;}
export function formatTime(seconds){seconds=Math.max(0,Math.ceil(seconds));return `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;}
export function conversionQuestion(value,from,to,page,topic='conv',difficulty=1){const answer=convert(value,from,to),detail=conversionSteps(value,from,to);return{id:`convert-${from}-${to}-${String(value).toUpperCase()}`,type:'num',topic,base:to,prompt:`Convierte ${value} (base ${from}) a base ${to}.`,answer,page,difficulty,kind:'convert',params:{value:String(value),from,to},explanation:detail.steps.join('\n'),hint:from===10?`Divide sucesivamente entre ${to}; lee los residuos de abajo hacia arriba.`:from===2&&[8,16].includes(to)?`Agrupa desde la derecha en bloques de ${to===8?3:4} bits.`:'La posición de la derecha tiene exponente 0.'};}
export function sumQuestion(values,page=10,difficulty=2){const r=sumSteps(values);return{id:'sum-'+values.join('-'),type:'num',topic:'sum',base:2,prompt:`Suma en binario: ${values.join(' + ')}.`,answer:r.out,page,difficulty,kind:'sum',params:{values},explanation:r.steps.join('\n'),hint:'Empieza por la derecha. 1 + 1 = 10₂: escribe 0 y lleva 1.'};}
export function similarQuestion(q){if(q.kind==='convert'){const{from,to,value}=q.params;const n=parseBase(value,from);return conversionQuestion((n+1).toString(from).toUpperCase(),from,to,q.page,q.topic,Math.max(1,q.difficulty-1));}if(q.kind==='sum'){const values=[...q.params.values];values[0]=(parseBase(values[0],2)+1).toString(2);return sumQuestion(values,q.page,Math.max(1,q.difficulty-1));}const a=QUESTION_BANK.filter(x=>x.topic===q.topic&&x.id!==q.id);return a[Math.floor(Math.random()*a.length)]||q;}
const mc=(id,topic,prompt,options,answer,page,explanation,difficulty=1)=>({id,topic,prompt,options,answer,page,explanation,difficulty,type:'mc'});
const tf=(id,topic,prompt,answer,page,explanation)=>({...mc(id,topic,prompt,['Verdadero','Falso'],answer,page,explanation),type:'tf'});
const num=(id,topic,prompt,answer,page,explanation,base=10,difficulty=1)=>({id,topic,prompt,answer:String(answer),page,explanation,base,difficulty,type:'num'});
export const QUESTION_BANK=[
 mc('b1','base','¿Qué símbolos utiliza el sistema binario?',['0 y 1','0 al 7','0 al 9'],'0 y 1',2,'La base 2 utiliza únicamente los símbolos 0 y 1, llamados bits.'),
 mc('b2','base','¿Cuál es la base del sistema octal?',['2','8','16'],'8',3,'El sistema octal tiene base 8 y usa 0, 1, 2, 3, 4, 5, 6 y 7.'),
 mc('b3','base','¿Qué valor decimal tiene F en hexadecimal?',['10','15','16'],'15',5,'A=10, B=11, C=12, D=13, E=14 y F=15.'),
 mc('b4','base','En un sistema posicional, el dígito de la derecha se multiplica por…',['La base elevada a 0','La base elevada a 1','El número de dígitos'],'La base elevada a 0',2,'Los exponentes empiezan en 0 a la derecha; cualquier base elevada a 0 vale 1.'),
 num('b5','base','¿Cuántos números diferentes se pueden representar con 3 bits?',8,11,'Son 2³=8 combinaciones, de 000 a 111. El máximo es 7, pero la cantidad de valores es 8.'),
 tf('b6','base','El número binario 1011110 es impar.','Falso',11,'Termina en 0: su valor es 94 decimal, que es par.'),
 tf('b7','base','El número octal 76 es par.','Verdadero',11,'7×8+6=62, que es par.'),
 tf('b8','base','El número hexadecimal BB es par.','Falso',11,'B=11; BB₁₆=11×16+11=187, impar.'),
 mc('b9','base','Selecciona el mayor: 11₁₆, 15₁₀ y 1111₂.',['11₁₆','15₁₀','1111₂'],'11₁₆',11,'11₁₆=17; 15₁₀=15; 1111₂=15. Convierte a una misma base para comparar.',2),
 num('b10','base','¿Qué número sigue de 177 octal?','200',13,'En octal no existen 8 ni 9. 7+1 reinicia el dígito a 0 y lleva 1: 177₈+1=200₈.',8,2),
 num('b11','base','¿Qué número sigue de 1001111 binario?','1010000',13,'Suma 1 desde la derecha: los cuatro unos finales pasan a 0 y el siguiente 0 pasa a 1.',2,2),
 num('b12','base','¿Qué número sigue de 29F hexadecimal?','2A0',13,'F+1=10₁₆: escribe 0 y lleva 1; 9+1=A. Resultado 2A0. Las opciones impresas de este reactivo no incluyen la respuesta correcta.',16,3),
 mc('b13','base','¿Qué estados eléctricos corresponden a 1 y 0?',['Encendido y apagado','Apagado y encendido','Ambos encendidos'],'Encendido y apagado',2,'El material relaciona 1 con encendido y 0 con apagado.'),
 mc('b14','base','¿Qué operaciones lógicas menciona el documento?',['AND, OR y NOT','SUM, AVG y MAX','HTML y CSS'],'AND, OR y NOT',2,'El documento menciona AND, OR y NOT como operaciones lógicas realizadas bit a bit.'),
 mc('b15','base','¿Cuál es un uso del hexadecimal indicado en el material?',['Definir colores RGB','Medir onzas','Reemplazar el bit'],'Definir colores RGB',5,'Cada componente rojo, verde y azul se representa con dos dígitos hexadecimales.'),
 mc('b16','base','¿Por qué ha disminuido el uso del octal según el texto?',['Por la popularidad del hexadecimal','Porque no es posicional','Porque usa letras'],'Por la popularidad del hexadecimal',3,'El material atribuye esta reducción a la popularidad del hexadecimal y a la naturaleza binaria de las computadoras.'),
 num('g1','group','¿Cuántos bits corresponden a un dígito octal?',3,3,'2³=8: un grupo de tres bits tiene las ocho combinaciones necesarias para un dígito octal.'),
 num('g2','group','¿Cuántos bits corresponden a un dígito hexadecimal?',4,9,'2⁴=16. Cada dígito hexadecimal se convierte en cuatro bits.'),
 tf('g3','group','Dos dígitos hexadecimales representan ocho bits.','Verdadero',5,'Cada dígito hexadecimal representa cuatro bits; dos representan 2×4=8 bits.'),
 mc('g4','group','Para convertir binario a octal, ¿desde dónde agrupas?',['Desde la derecha, de 3 en 3','Desde la izquierda, de 4 en 4','Desde la derecha, de 2 en 2'],'Desde la derecha, de 3 en 3',8,'Forma grupos de tres bits desde la derecha. Completa el primer grupo con ceros a la izquierda si hace falta.'),
 num('s1','sum','¿Cuál es el resultado de 1 + 1 en binario?','10',10,'1+1=2 decimal=10₂: escribe 0 en la columna y lleva 1.',2),
 num('s2','sum','¿Cuál es el máximo al sumar dos números binarios de 4 bits?','11110',12,'El mayor número de 4 bits es 1111₂=15. 15+15=30=11110₂.',2,2),
 num('u1','units','¿Cuántos bits contiene un byte?',8,16,'Un byte está compuesto por 8 bits. No confundas byte con bit.'),
 num('u2','units','Según el documento, ¿cuántos bytes contiene 1 KB?',1024,15,'El material usa la equivalencia 1 KB=1024 bytes.'),
 num('u3','units','Según el documento, ¿cuántos KB contiene 1 MB?',1024,15,'Cada salto entre KB, MB, GB, TB y PB equivale a 1024 unidades del nivel anterior.'),
 num('u4','units','Según el documento, ¿cuántos MB contiene 2 GB?',2048,15,'1 GB=1024 MB; 2×1024=2048 MB.',10,2),
 mc('u5','units','Selecciona el orden de menor a mayor.',['KB → MB → GB → TB','MB → KB → TB → GB','GB → MB → KB → TB'],'KB → MB → GB → TB',17,'El orden es bit, byte, KB, MB, GB, TB, PB.'),
 tf('u6','units','Un bit puede tener más de tres valores.','Falso',16,'Un bit solo puede tomar dos valores: 0 o 1.'),
 num('u7','units','¿Cuántos GB contiene 1 TB según el material?',1024,15,'1 TB equivale a 1024 GB.'),
 num('u8','units','¿Cuántos TB contiene 1 PB según el material?',1024,15,'1 PB equivale a 1024 TB.'),
 num('a1','ascii','¿Cuántos bits utiliza el ASCII original?',7,15,'La versión original de 1963 utiliza 7 bits y codifica 2⁷=128 símbolos.'),
 num('a2','ascii','¿Cuántos símbolos puede codificar el ASCII original?',128,15,'Con 7 bits se representan 2⁷=128 combinaciones.'),
 num('a3','ascii','¿Cuántos bits utiliza el ASCII extendido descrito en el PDF?',8,17,'El material describe una extensión de 8 bits, capaz de representar 256 símbolos.'),
 num('a4','ascii','¿Cuántos símbolos representa el ASCII extendido descrito?',256,16,'2⁸=256. El material lo relaciona con caracteres como ñ y letras acentuadas.'),
 mc('a5','ascii','¿Qué significa ASCII?',['American Standard Code for Information Interchange','Advanced System for Computer Information','American Storage Code for Internet'],'American Standard Code for Information Interchange',15,'La traducción usada es Código Estándar Americano para el Intercambio de Información.'),
 num('a6','ascii','¿En qué año se introdujo por primera vez ASCII?',1963,15,'El documento indica 1963 y una versión original de 7 bits.'),
 mc('a7','ascii','En la tabla, ¿qué carácter representa el decimal 65?',['A','a','0'],'A',16,'Busca 65 en la columna decimal: corresponde a A, y a 41 en hexadecimal.'),
 mc('a8','ascii','Decodifica: 80 114 101 112 97 32 57.',['Prepa 9','prepa 9','Prepa9'],'Prepa 9',17,'80=P, 114=r, 101=e, 112=p, 97=a, 32=espacio y 57=9. Respeta mayúsculas y espacios.',2),
 num('a9','ascii','Según la tabla, ¿qué código decimal corresponde al dígito 0?',48,16,'El carácter 0 tiene código 48 decimal (30 hexadecimal), no el valor numérico 0.'),
 ...[[47,10,2,7],[101,10,2,7],[122,10,2,7],['1000100',2,10,7],[36,10,2,7],['1100011',2,10,7],['125',8,10,7],[201,10,8,8],[1026,10,8,8],[2010,10,8,8],['12B',16,10,8],[218,10,16,8],[1001,10,16,8],['1AAC',16,10,8],['2F3',16,10,8],['123D',16,10,8],[64,10,16,8],[34,10,2,11],[33,10,8,12],[57,10,16,12]].map((p,i)=>conversionQuestion(...p,'conv',i%3+1)),
 ...[['10110111',2,8,9],['133',8,2,9],['52',8,2,9],['170',8,2,9],['11000110',2,16,9],['32',16,2,9],['3A',16,2,9],['FE',16,2,9],['31',8,2,12],['3B',16,2,12]].map((p,i)=>conversionQuestion(...p,'group',i%2+1)),
 sumQuestion(['11011','11111','10011'],10,3),sumQuestion(['10011','11110','11011'],13,3),sumQuestion(['101','11'],10,1),sumQuestion(['1111','1111'],12,2),
 ...[15,12,10,9,7,6,5,3].map(n=>({...conversionQuestion(n,10,2,14,'conv',1),prompt:`Cucharas de 8, 4, 2 y 1 onzas: representa ${n} onzas con el mínimo de usos. Escribe cuatro bits (8, 4, 2, 1).`,answer:n.toString(2).padStart(4,'0'),explanation:`${n} = ${[8,4,2,1].filter(v=>n&v).join(' + ')} onzas. Usa una vez cada cuchara marcada con 1; las marcadas con 0 no se usan. Patrón: ${n.toString(2).padStart(4,'0')}. Solo se permite sumar, no restar.`}))
];
export const DIAGNOSTIC_IDS=['b1','b4','b3','g1','s1','u1','a1','a2'];
export function diagnosticQuestions(){return [...DIAGNOSTIC_IDS.map(id=>QUESTION_BANK.find(q=>q.id===id)),conversionQuestion(34,10,2,11),conversionQuestion('125',8,10,7)];}
export function examQuestions(){const ids=['b5','b6','b7','b8','b9','b10','b11','g1','g2','s2','u1','u5','u6','a1','a3','a4','a8'];return [...ids.map(id=>QUESTION_BANK.find(q=>q.id===id)),conversionQuestion(34,10,2,11),conversionQuestion(33,10,8,12),conversionQuestion(57,10,16,12),conversionQuestion('31',8,2,12,'group'),conversionQuestion('3B',16,2,12,'group'),conversionQuestion('12B',16,10,8),sumQuestion(['10011','11110','11011'],13,3),QUESTION_BANK.find(q=>q.id==='u4')];}
export const CARDS=[
 ['base','¿Qué significa que un sistema sea posicional?','Cada dígito se multiplica por una potencia de su base. El exponente empieza en 0 a la derecha.',2],
 ['base','Bases y símbolos: binario, octal, decimal y hexadecimal.','Binario: 2, 0–1. Octal: 8, 0–7. Decimal: 10, 0–9. Hexadecimal: 16, 0–9 y A–F.',6],
 ['base','¿Cuánto valen A, B, C, D, E y F?','A=10 · B=11 · C=12 · D=13 · E=14 · F=15.',5],
 ['conv','¿Cómo conviertes decimal a otra base?','Divide sucesivamente entre la base destino. Lee los residuos de abajo hacia arriba.',7],
 ['conv','¿Cómo conviertes a decimal?','Multiplica cada dígito por la potencia de su base y suma los resultados.',8],
 ['group','Binario ↔ octal: ¿cuántos bits y desde dónde?','Grupos de 3 desde la derecha. Cada dígito octal produce 3 bits.',8],
 ['group','Binario ↔ hexadecimal: ¿cuántos bits?','Grupos de 4 desde la derecha. Cada dígito hexadecimal produce 4 bits.',9],
 ['sum','¿Cómo sumas 1 + 1 + 1?','11₂: escribe 1 y lleva 1 a la siguiente columna.',10],
 ['base','Con n bits, ¿cantidad de valores y máximo?','Cantidad: 2ⁿ. Máximo sin signo: 2ⁿ−1. Con 3 bits: 8 valores, de 0 a 7.',11],
 ['units','Bit y byte: ¿en qué se diferencian?','Un bit vale 0 o 1. Un byte contiene 8 bits.',15],
 ['units','Completa la escala de almacenamiento.','byte → KB → MB → GB → TB → PB. Según el PDF, cada salto equivale a 1024 unidades del nivel anterior.',15],
 ['ascii','ASCII original: año, bits y símbolos.','1963 · 7 bits · 128 símbolos.',15],
 ['ascii','ASCII extendido según el documento.','8 bits · 256 símbolos; incluye caracteres como ñ y letras acentuadas.',16],
 ['ascii','¿Qué representan 65, 48 y 32 en la tabla ASCII?','65 = A · 48 = carácter 0 · 32 = espacio.',16],
 ['conv','¿Cómo mides 15 onzas con cucharas de 8, 4, 2 y 1?','8 + 4 + 2 + 1 = 15. Patrón 1111: cuatro usos, solo sumando.',14],
 ['base','¿Qué sigue de 29F₁₆?','2A0₁₆. F+1 deja 0 y lleva 1; 9+1=A. Las opciones de esta pregunta del PDF tienen una errata.',13]
].map(([topic,front,back,page],i)=>({id:'card'+i,topic,front,back,page}));
