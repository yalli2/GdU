# GdU

Gramática de uso del español A1–A2, Unidades 1–5. Study pages for class.

- Unidad1/ ~ Unidad5/ : each folder has its own index.html

## 월별 접근 권한 (관리자)
- 관리 페이지: `admin/` (예: https://yalli2.github.io/GdU/admin/ 또는 https://yalli2.github.io/GdU_A1_B2/admin/ — 어느 쪽에서 저장해도 두 사이트에 함께 적용)
- 달마다 **전체 공개 / 등록 학생만 / 전체 잠금** 중 하나를 고르고, 학생별로 어느 달·어느 사이트(A1–A2, A1–B2)를 쓸 수 있는지 체크합니다. 설정하지 않은 달은 기본값을 따릅니다.
- 학생은 자기 접근 코드(6자리)로 들어가며, 들어가면 이름이 학습 기록에 자동으로 들어갑니다. 달이 바뀌면 권한을 다시 확인합니다(서울 시간 기준).
- 관리자 비밀번호로는 잠긴 달에도 사이트에 들어갈 수 있습니다.
- 설정은 `access.json`에 저장됩니다(학생 코드는 해시로, 관리자용 원본 코드는 관리자 비밀번호로 암호화). 저장 버튼은 GitHub 토큰(Contents: Read and write)으로 두 저장소의 `access.json`을 함께 바꿉니다.
- 정적 사이트에서 동작하는 잠금이라, 페이지 소스를 직접 열어 보는 사람까지 막지는 못합니다(수업 이용 관리용).
