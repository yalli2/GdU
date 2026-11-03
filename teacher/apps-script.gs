// 구글 시트 → 확장 프로그램 → Apps Script 에 붙여 넣고,
// 배포 → 새 배포 → 유형: 웹 앱 / 실행 사용자: 나 / 액세스: 모든 사용자 → 웹 앱 URL 복사
// 그 URL을 GdU 저장소의 records.js 맨 위 SYNC_URL 에 붙여 넣으세요.
function doPost(e) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('기록') ||
           SpreadsheetApp.getActiveSpreadsheet().insertSheet('기록');
  if (sh.getLastRow() === 0) sh.appendRow(['날짜','시간','이름','단원','점수','만점','점수율(%)','전송시각']);
  var r = JSON.parse(e.postData.contents);
  sh.appendRow([r.date, r.time, r.name, r.unit, r.score, r.total, r.pct, r.t]);
  return ContentService.createTextOutput('ok');
}
