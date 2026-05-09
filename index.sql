<!DOCTYPE html>
<html lang="zh" dir="ltr">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="robots" content="noindex">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>导出: /home/mengying/code_projects/part-time-system/backend/database.db - Adminer</title>
<link rel="stylesheet" href="adminer.php?file=default.css&amp;version=5.4.1">
<link rel='stylesheet' media='(prefers-color-scheme: dark)' href='adminer.php?file=dark.css&amp;version=5.4.1'>
<meta name='color-scheme' content='light dark'>
<script src='adminer.php?file=functions.js&amp;version=5.4.1' nonce="ODE5ZGY5NmUwNjYxY2QzMDg0NmQ5NGQzN2Y0YjBjNzI="></script>
<link rel='icon' href='data:image/gif;base64,R0lGODlhEAAQAJEAAAQCBPz+/PwCBAROZCH5BAEAAAAALAAAAAAQABAAAAI2hI+pGO1rmghihiUdvUBnZ3XBQA7f05mOak1RWXrNq5nQWHMKvuoJ37BhVEEfYxQzHjWQ5qIAADs='>
<link rel='apple-touch-icon' href='adminer.php?file=logo.png&amp;version=5.4.1'>

<body class='ltr nojs adminer'>
<script nonce="ODE5ZGY5NmUwNjYxY2QzMDg0NmQ5NGQzN2Y0YjBjNzI=">mixin(document.body, {onkeydown: bodyKeydown, onclick: bodyClick});
document.body.classList.replace('nojs', 'js');
const offlineMessage = '您离线了。';
const thousandsSeparator = ',';</script>
<div id='help' class='jush-sqlite jsonly hidden'></div>
<script nonce="ODE5ZGY5NmUwNjYxY2QzMDg0NmQ5NGQzN2Y0YjBjNzI=">mixin(qs('#help'), {onmouseover: () => { helpOpen = 1; }, onmouseout: helpMouseout});</script>
<div id='content'>
<span id='menuopen' class='jsonly'><button type='submit' name='' title='' class='icon icon-move'><span>menu</span></button></span><script nonce="ODE5ZGY5NmUwNjYxY2QzMDg0NmQ5NGQzN2Y0YjBjNzI=">qs('#menuopen').onclick = event => { qs('#foot').classList.toggle('foot'); event.stopPropagation(); }</script>
<p id="breadcrumb"><a href="adminer.php?sqlite=">SQLite</a> » <a href='adminer.php?sqlite=&amp;username=' accesskey='1' title='Alt+Shift+1'>服务器</a> » <a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db">/home/mengying/code_projects/part-time-system/backend/database.db</a> » 导出
<h2>导出: /home/mengying/code_projects/part-time-system/backend/database.db</h2>
<div id='ajaxstatus' class='jsonly hidden'></div>
<div class='error'>POST 数据太大。请减少数据或者增加 'post_max_size' 配置命令。</div>

<form action="" method="post">
<table class="layout">
<tr><th>输出<td><label><input type='radio' name='output' value='text' checked>打开</label><label><input type='radio' name='output' value='file'>保存</label><label><input type='radio' name='output' value='gz'>gzip</label>
<tr><th>格式<td><label><input type='radio' name='format' value='sql' checked>SQL</label><label><input type='radio' name='format' value='csv'>CSV,</label><label><input type='radio' name='format' value='csv;'>CSV;</label><label><input type='radio' name='format' value='tsv'>TSV</label>
<tr><th>表<td><select name='table_style'><option><option selected>DROP+CREATE<option>CREATE</select><label><input type='checkbox' name='auto_increment' value='1'>自动增量</label><label><input type='checkbox' name='triggers' value='1' checked>触发器</label><tr><th>数据<td><select name='data_style'><option><option>TRUNCATE+INSERT<option selected>INSERT</select></table>
<p><input type="submit" value="导出">
<input type='hidden' name='token' value='966806:873599'>

<table>
<script nonce="ODE5ZGY5NmUwNjYxY2QzMDg0NmQ5NGQzN2Y0YjBjNzI=">qsl('table').onclick = dumpClick;</script>
<thead><tr><th style='text-align: left;'><label class='block'><input type='checkbox' id='check-tables'>表</label><script nonce="ODE5ZGY5NmUwNjYxY2QzMDg0NmQ5NGQzN2Y0YjBjNzI=">qs('#check-tables').onclick = partial(formCheck, /^tables\[/);</script><th style='text-align: right;'><label class='block'>数据<input type='checkbox' id='check-data'></label><script nonce="ODE5ZGY5NmUwNjYxY2QzMDg0NmQ5NGQzN2Y0YjBjNzI=">qs('#check-data').onclick = partial(formCheck, /^data\[/);</script></thead>
<tr><td><label class='block'><input type='checkbox' name='tables[]' value='companies'>companies</label><td align='right'><label class='block'><span id='Rows-companies'></span><input type='checkbox' name='data[]' value='companies'></label>
<tr><td><label class='block'><input type='checkbox' name='tables[]' value='education'>education</label><td align='right'><label class='block'><span id='Rows-education'></span><input type='checkbox' name='data[]' value='education'></label>
<tr><td><label class='block'><input type='checkbox' name='tables[]' value='job_applications'>job_applications</label><td align='right'><label class='block'><span id='Rows-job_applications'></span><input type='checkbox' name='data[]' value='job_applications'></label>
<tr><td><label class='block'><input type='checkbox' name='tables[]' value='jobs'>jobs</label><td align='right'><label class='block'><span id='Rows-jobs'></span><input type='checkbox' name='data[]' value='jobs'></label>
<tr><td><label class='block'><input type='checkbox' name='tables[]' value='messages'>messages</label><td align='right'><label class='block'><span id='Rows-messages'></span><input type='checkbox' name='data[]' value='messages'></label>
<tr><td><label class='block'><input type='checkbox' name='tables[]' value='resumes'>resumes</label><td align='right'><label class='block'><span id='Rows-resumes'></span><input type='checkbox' name='data[]' value='resumes'></label>
<tr><td><label class='block'><input type='checkbox' name='tables[]' value='reviews'>reviews</label><td align='right'><label class='block'><span id='Rows-reviews'></span><input type='checkbox' name='data[]' value='reviews'></label>
<tr><td><label class='block'><input type='checkbox' name='tables[]' value='saved_jobs'>saved_jobs</label><td align='right'><label class='block'><span id='Rows-saved_jobs'></span><input type='checkbox' name='data[]' value='saved_jobs'></label>
<tr><td><label class='block'><input type='checkbox' name='tables[]' value='users' checked>users</label><td align='right'><label class='block'><span id='Rows-users'></span><input type='checkbox' name='data[]' value='users' checked></label>
<tr><td><label class='block'><input type='checkbox' name='tables[]' value='work_experience'>work_experience</label><td align='right'><label class='block'><span id='Rows-work_experience'></span><input type='checkbox' name='data[]' value='work_experience'></label>
<tr><td><label class='block'><input type='checkbox' name='tables[]' value='sqlite_sequence'>sqlite_sequence</label><td align='right'><label class='block'><span id='Rows-sqlite_sequence'></span><input type='checkbox' name='data[]' value='sqlite_sequence'></label>
<script nonce="ODE5ZGY5NmUwNjYxY2QzMDg0NmQ5NGQzN2Y0YjBjNzI=">ajaxSetHtml('adminer.php?sqlite=&username=&db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&script=db');</script>
</table>
</form>
</div>

<div id='foot' class='foot'>
<div id='menu'>
<h1><a href='https://www.adminer.org/' target="_blank" rel="noreferrer noopener" id='h1'><img src='adminer.php?file=logo.png&amp;version=5.4.1' width='24' height='24' alt='' id='logo'>Adminer</a> <span class='version'>5.4.1 <a href='https://www.adminer.org/#download' target="_blank" rel="noreferrer noopener" id='version'></a></span></h1>
<form action='' method='post'>
<div id='lang'><label>语言: <select name='lang'><option value="en">English<option value="ar">العربية<option value="bg">Български<option value="bn">বাংলা<option value="bs">Bosanski<option value="ca">Català<option value="cs">Čeština<option value="da">Dansk<option value="de">Deutsch<option value="el">Ελληνικά<option value="es">Español<option value="et">Eesti<option value="fa">فارسی<option value="fi">Suomi<option value="fr">Français<option value="gl">Galego<option value="he">עברית<option value="hi">हिन्दी<option value="hu">Magyar<option value="id">Bahasa Indonesia<option value="it">Italiano<option value="ja">日本語<option value="ka">ქართული<option value="ko">한국어<option value="lt">Lietuvių<option value="lv">Latviešu<option value="ms">Bahasa Melayu<option value="nl">Nederlands<option value="no">Norsk<option value="pl">Polski<option value="pt">Português<option value="pt-br">Português (Brazil)<option value="ro">Limba Română<option value="ru">Русский<option value="sk">Slovenčina<option value="sl">Slovenski<option value="sr">Српски<option value="sv">Svenska<option value="ta">த‌மிழ்<option value="th">ภาษาไทย<option value="tr">Türkçe<option value="uk">Українська<option value="uz">Oʻzbekcha<option value="vi">Tiếng Việt<option value="zh" selected>简体中文<option value="zh-tw">繁體中文</select><script nonce="ODE5ZGY5NmUwNjYxY2QzMDg0NmQ5NGQzN2Y0YjBjNzI=">qsl('select').onchange = function () { this.form.submit(); };</script></label> <input type='submit' value='使用' class='hidden'>
<input type='hidden' name='token' value='1001623:842878'>
</div>
</form>
<script src='adminer.php?file=jush.js&amp;version=5.4.1' nonce="ODE5ZGY5NmUwNjYxY2QzMDg0NmQ5NGQzN2Y0YjBjNzI=" defer></script>
<script nonce="ODE5ZGY5NmUwNjYxY2QzMDg0NmQ5NGQzN2Y0YjBjNzI=">
var jushLinks = { sqlite:{
	"adminer.php?sqlite=&username=&db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&table=$&": /\b(companies|education|job_applications|jobs|messages|resumes|reviews|saved_jobs|sqlite_sequence|users|work_experience)\b/g
}
};
jushLinks.bac = jushLinks.sqlite;
jushLinks.bra = jushLinks.sqlite;
jushLinks.sqlite_quo = jushLinks.sqlite;
jushLinks.mssql_bra = jushLinks.sqlite;
</script>
<script nonce="ODE5ZGY5NmUwNjYxY2QzMDg0NmQ5NGQzN2Y0YjBjNzI=">syntaxHighlighting('3.4', '');</script>
<form action=''>
<p id='dbs'>
<input type='hidden' name='sqlite' value=''>
<input type='hidden' name='username' value=''>
<label title='数据库'>数据库: <input name='db' value='/home/mengying/code_projects/part-time-system/backend/database.db' autocapitalize='off' size='19'>
</label><input type='submit' value='使用'>
<input type='hidden' name='dump' value=''>
</p></form>
<p class='links'>
<a href='adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;sql='>SQL命令</a>
<a href='adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;import='>导入</a>
<a href='adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;dump=' id='dump' class='active '>导出</a>
<a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;create=">创建表</a>
<ul id='tables'><script nonce="ODE5ZGY5NmUwNjYxY2QzMDg0NmQ5NGQzN2Y0YjBjNzI=">mixin(qs('#tables'), {onmouseover: menuOver, onmouseout: menuOut});</script>
<li><a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;select=companies" class='select' title='选择数据'>选择</a> <a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;table=companies" class='structure' title='显示结构'>companies</a>
<li><a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;select=education" class='select' title='选择数据'>选择</a> <a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;table=education" class='structure' title='显示结构'>education</a>
<li><a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;select=job_applications" class='select' title='选择数据'>选择</a> <a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;table=job_applications" class='structure' title='显示结构'>job_applications</a>
<li><a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;select=jobs" class='select' title='选择数据'>选择</a> <a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;table=jobs" class='structure' title='显示结构'>jobs</a>
<li><a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;select=messages" class='select' title='选择数据'>选择</a> <a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;table=messages" class='structure' title='显示结构'>messages</a>
<li><a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;select=resumes" class='select' title='选择数据'>选择</a> <a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;table=resumes" class='structure' title='显示结构'>resumes</a>
<li><a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;select=reviews" class='select' title='选择数据'>选择</a> <a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;table=reviews" class='structure' title='显示结构'>reviews</a>
<li><a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;select=saved_jobs" class='select' title='选择数据'>选择</a> <a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;table=saved_jobs" class='structure' title='显示结构'>saved_jobs</a>
<li><a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;select=sqlite_sequence" class='select' title='选择数据'>选择</a> <a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;table=sqlite_sequence" class='structure' title='显示结构'>sqlite_sequence</a>
<li><a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;select=users" class='select' title='选择数据'>选择</a> <a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;table=users" class='structure' title='显示结构'>users</a>
<li><a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;select=work_experience" class='select' title='选择数据'>选择</a> <a href="adminer.php?sqlite=&amp;username=&amp;db=%2Fhome%2Fmengying%2Fcode_projects%2Fpart-time-system%2Fbackend%2Fdatabase.db&amp;table=work_experience" class='structure' title='显示结构'>work_experience</a>
</ul>
</div>
<form action="" method="post">
<p class="logout">
<span>
</span>
<input type="submit" name="logout" value="登出" id="logout">
<input type='hidden' name='token' value='393834:366211'>
</form>
</div>

<script nonce="ODE5ZGY5NmUwNjYxY2QzMDg0NmQ5NGQzN2Y0YjBjNzI=">setupSubmitHighlight(document);</script>
