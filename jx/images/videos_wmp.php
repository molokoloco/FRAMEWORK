<?php
require("head.php");
?>
<?php
define('IN_PHPBB', 1);
include_once("forum/admin/admin/config.inc.php");
include_once("forum/admin/admin/config_param.php");

// DETECTION du PLAYER
echo '<script language="JavaScript" type="text/JavaScript">
var CPlayer = GetCookie("Player");
if (CPlayer!="PlayerWmp"||PlayerWmp!="oui") { 
	alert("Votre lecteur Window Media n\'a pas été détecté. Veuillez relancer la détection");
	parent.location.href="videos.php?Pref=oui";
}
</script>';

// Si aucune video selectionnnée on ouvre le journal (VIDEO ID ??? )
if ($emissionId == '') { $emissionId = $journalId; }
if ($videosId == '')
{
$requete2 = "SELECT videosId FROM Videos WHERE (emissionId='$emissionId' AND videosActiv='1' ) ORDER BY videosId ASC LIMIT 1";
$resultat2 = mysql_query($requete2,$db) or die();
$ligne2 = mysql_fetch_object($resultat2);
$videosId = $ligne2->videosId;
}
// INFOS SUR LA VIDEO  AND videosActiv='1'
$requete = "SELECT videosLinkReal128,videosLinkWmp128,videosImgName FROM Videos WHERE (videosId='$videosId') LIMIT 1";
$resultat = mysql_query($requete,$db);
$ligne = mysql_fetch_object($resultat);
$videosLinkReal128 = $ligne->videosLinkReal128;
$videosLinkWmp128 = $ligne->videosLinkWmp128;
$videosImgName = $ligne->videosImgName;

// Si cette video n'existe pas à ce format ...
if ($videosLinkWmp128 == '' && $videosLinkReal128!='') {
	echo '<script language="JavaScript">
	<!--
	alert("Désolé la vidéo n\'existe pas dans ce format, vous allez être redirigé sur la page Real Player'.$videosLinkWmp128.' '.$videosId.'");
	self.location.href="videos_real.php?videosId='.$videosId.'";
	-->
	</script>';
}
else if ($videosLinkWmp128=='' && $videosLinkReal128=='') {
	echo '<script language="JavaScript">
	<!--
	alert("Désolé la vidéo est introuvable sur le serveur, vous allez être redirigé sur la dernière vidéo mise en ligne");
	parent.location.href="videos_player.php";
	-->
	</script>';
}
//
if (strpos($videosLinkWmp128,"mms:") !== false) $Stream = $videosLinkWmp128;
else $Stream = $HostStreamWmp.$videosLinkWmp128;

?>
<script src="cookies.js"></script>
<script language="JavaScript">
<!--// Script Mix By Molokoloco (^_^) 2003
function WinPos(ze) {
var HA = screen.availWidth;
var LA = screen.availHeight;
var papa = parent.window;
var HR = 1024; var LR = 768;
var left = ''; var top = '';

if (ze==0) {
if (document.all) { papa.resizeTo('720','576'); }
else if (document.layers) { papa.outerHeight = 720; papa.outerWidth = 576; }
left = (HA-760)/2; top = (LA-576)/2; papa.moveTo(left,top);
}
if (ze==1) {
	if (HR > HA || LR > LA) { HR = HA; LR = LA; }
	if (document.all) { papa.resizeTo(HR,LR); }
	else if (document.layers) { papa.outerHeight = HR; papa.outerWidth = LR; }
	left = (HA-HR)/2; top = (LA-LR)/2; papa.moveTo(left,top);
}
if (ze==2) {
	if (document.all) { papa.resizeTo(HA,LA); }
	else if (document.layers) { papa.outerHeight = HA; papa.outerWidth = LA; }
	left = 0; top = 0; papa.moveTo(left,top);
}
}
--> 
</script><script language="JavaScript">
<!--
function bName() {
if (navigator.appName == "Microsoft Internet Explorer")
return 1;
if (navigator.appName == "Netscape")
return 2;
return 0;
}
function bVer() {
// return version number (e.g., 4.03)
return parseFloat(navigator.appVersion)
}
var nameCode = bName();
var versionCode = bVer();
var mac = (navigator.userAgent.indexOf("Mac")!=-1);
var activeX = (nameCode == 1 && versionCode >= 4.0) ? true : false; 
--> 
</script><script language="JavaScript">
<!--// Script Mix By Molokoloco (^_^) 2003
function resize(size) {
var width = document.MediaPlayer.ImageSourceWidth;
var height = document.MediaPlayer.ImageSourceHeight;
if (width > 0) {
	var L = width.toString();
	if (size == '1') { L = L*1.5; }
	if (size == '2') { L = L*2; }
		if (activeX) { document.MediaPlayer.style.width = L; }
		else { document.MediaPlayer.setAttribute("width", L ); }
}
if (height > 0) {
	var H = height.toString();
	if (size == '0') { H = (H*1)+70; }
	if (size == '1') { H = (H*1.5)+70; }
	if (size == '2') { H = (H*2)+70; }
		if (activeX) { document.MediaPlayer.style.height = H; }
		else { document.MediaPlayer.setAttribute("height", H ); } 
}
document.MediaPlayer.displaySize = 4;
setTimeout("resize(size)",1000);
WinPos(size);
}
function fullscreen() {document.MediaPlayer.DisplaySize = 3;}
-->
</script>
<body onLoad="focus();setTimeout('resize(0)',2600);" scroll="no" style="background:#FFFFFF;">
<div style="position:absolute; left:5%; top:1; z-index:0; width: 80%; height: 80%;" id="movie"> 
  <table width="100%" height="100%" border="0" cellpadding="0" cellspacing="0">
    <tr> 
      <td align="center"><object classid="CLSID:22d6f312-b0f6-11d0-94ab-0080c74c7e95" codebase="http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=5,1,52,701"  type="application/x-oleobject" name="MediaPlayer" width="288" height="216" standby="Chargement de la vidéo..." id="MediaPlayer" style="background-image: url(<?php echo $videosDir.'/'.$videosImgName; ?>); background-repeat: no-repeat; background-position: center center; border: 1px solid #B4C2E2;">
<param name="FileName"  value="<?php echo $Stream; ?>">
<param name="AutoStart" value="1">
<param name="ShowStatusBar" value="1">
<param name="AnimationAtStart" value="0">
<param name="ShowControls" value="1">
<param name="AllowChangeDisplaySize" value="1">
<param name="enableContextMenu" value="1">
<param name="ShowDisplay" value="0">
<param name="DisplaySize" value="0">
<param name="AutoSize" value="1">
<param name="EnableFullScreenControls" value="1">
<param name="Volume" value="-200">
<embed width="288" height="216" autostart="1" align="center" style="background-image: url(<?php echo $videosDir.'/'.$videosImgName; ?>); background-repeat: no-repeat; background-position: center center; border: 1px solid #B4C2E2;" id="MediaPlayer" name="MediaPlayer" type="application/x-mplayer2" filename="<?php echo $Stream; ?>" pluginspage="http://www.microsoft.com/windows/mediaplayer/" showstatusbar="1" animationatstart="0" showcontrols="1" allowchangedisplaysize="1" enablecontextmenu="1" showdisplay="0" displaysize="0" autosize="1" enablefullscreencontrols="1" volume="-200"></embed><noembed><a href="<?php echo $Stream; ?>" class="textpetit">Cliquez&nbsp;ici&nbsp;!</a></noembed></object></td>
    </tr>
  </table>
</div>
<table width="100%" height="100%" border="0" cellpadding="0" cellspacing="0">
  <tr align="right" valign="bottom"> 
    <td colspan="2">
<table width="1" border="0" align="top" cellpadding="0" cellspacing="0">
        <form name="info">
          <tr> 
            <td align="right"><input name="x1" type="button" class="buttonvideo" value="x1" onClick="javascript:resize('0');" title="Afficher la vidéo à 100%"></td>
          </tr>
          <tr> 
            <td align="right"><input name="x1.5" type="button" class="buttonvideo" value="x1.5" onClick="javascript:resize('1');" title="Afficher la vidéo à 150%"></td>
          </tr>
          <tr> 
            <td align="right"><input name="x2" type="button" class="buttonvideo" value="x2" onClick="javascript:resize('2');" title="Afficher la vidéo à 200%"></td>
          </tr>
          <tr> 
            <td align="right"><input name="Plein" type="button" class="buttonvideo" onClick="javascript:javascript:fullscreen();" value="Plein &eacute;cran" title="Voir en plein écran (Double clic ou &quot;esc&quot; pour quitter)"></td>
          </tr>
          <tr> 
            <td align="right"><img src="/images/pix.gif" width="10" height="10"></td>
          </tr>
        </form>
      </table>
    </td>
  </tr>
  <tr> 
    <td height="1" colspan="2"><img src="images_videos/bar2.gif" width="100%" height="6"></td>
  </tr>
  <tr> 
    <td width="50%" height="50" background="images_videos/motif_bar_argent-1b.gif"><table border="0" cellspacing="0" cellpadding="5">
        <tr> 
          <td nowrap><span class="textpetitdescr">Cliquez <a href="<?php echo $Stream; ?>"><b>ici</b></a> pour&nbsp;lancer directement<br>
la vidéo dans <i>Windows média player</i></span></td>
        </tr>
      </table></td>
    <td width="50%" align="right" background="images_videos/motif_bar_argent-1b.gif"><a href="http://www.microsoft.com/windows/windowsmedia/download/default.asp?DispLang=fr" target="_blank" title="Télécharger le plug-in Windows media player série 9 !"><img height=50 src="images_videos/wmp3.gif" width=94 border=0></a></td>
  </tr>
</table>
<script language="JavaScript1.1" >
<!--
setTimeout('resize(0)',2600);
//
hsh = new Date();
hsd = document;
//hsr = hsd.referrer.replace(/[<>]/g, ''); //NOFRAME
hsr = parent.document.referrer.replace(/[<>]/g, ''); //FRAME
hsi = '<img width="1" height="1" src="http://logi6.xiti.com/hit.xiti?s=136376';
hsi += '&p=';
hsi += '&hl=' + hsh.getHours() + 'x' + hsh.getMinutes() + 'x' + hsh.getSeconds();
if(parseFloat(navigator.appVersion)>=4)
{Xiti_s=screen;hsi += '&r=' + Xiti_s.width + 'x' + Xiti_s.height + 'x' + Xiti_s.pixelDepth + 'x' + Xiti_s.colorDepth;}
hsd.writeln(hsi + '&ref=' + hsr.replace(/&/g, '$') + '"><\!--');
//-->
</script><noscript><img width="1" height="1" src="http://logi6.xiti.com/hit.xiti?s=136376&p=&"></noscript>
</body>
</html>
