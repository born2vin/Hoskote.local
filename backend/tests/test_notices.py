from datetime import datetime, timedelta

import pytest

from app.schemas import NoticeCreate


class TestNoticeExpiryDateParsing:
    def test_date_only_string_is_extended_to_end_of_day(self):
        notice = NoticeCreate(title="T", description="D", expiry_date="2026-01-15")
        assert notice.expiry_date == datetime(2026, 1, 15, 23, 59, 59)

    def test_full_datetime_string_is_kept_as_is(self):
        notice = NoticeCreate(title="T", description="D", expiry_date="2026-01-15T10:30:00")
        assert notice.expiry_date == datetime(2026, 1, 15, 10, 30, 0)


class TestNoticeExpiryFilter:
    """Validates the expiry_date filter enforced by GET /api/notices/active."""

    def _create_notice(self, db_session, admin, title, expiry_date):
        from app.models import Notice
        notice = Notice(
            title=title,
            description="desc",
            expiry_date=expiry_date,
            created_by_id=admin.id,
        )
        db_session.add(notice)
        db_session.commit()
        return notice

    def test_active_endpoint_excludes_expired_notices(self, db_session, make_user, client_as):
        admin = make_user(role="Admin")
        resident = make_user(role="Resident")
        self._create_notice(db_session, admin, "Expired notice", datetime.utcnow() - timedelta(days=1))
        self._create_notice(db_session, admin, "Active notice", datetime.utcnow() + timedelta(days=1))

        response = client_as(resident).get("/api/notices/active")

        assert response.status_code == 200
        titles = [n["title"] for n in response.json()]
        assert titles == ["Active notice"]

    def test_active_endpoint_excludes_notice_expiring_exactly_now(self, db_session, make_user, client_as):
        admin = make_user(role="Admin")
        resident = make_user(role="Resident")
        self._create_notice(db_session, admin, "Just expired", datetime.utcnow())

        response = client_as(resident).get("/api/notices/active")

        assert response.status_code == 200
        assert response.json() == []


class TestNoticeManagementRoles:
    def test_resident_cannot_create_notice(self, make_user, client_as):
        resident = make_user(role="Resident")
        response = client_as(resident).post("/api/notices/", json={
            "title": "Water shutdown",
            "description": "Water will be shut off for maintenance",
            "expiry_date": "2026-01-15",
        })
        assert response.status_code == 403

    def test_admin_can_create_notice(self, make_user, client_as):
        admin = make_user(role="Admin")
        response = client_as(admin).post("/api/notices/", json={
            "title": "Water shutdown",
            "description": "Water will be shut off for maintenance",
            "expiry_date": "2026-01-15",
        })
        assert response.status_code == 200
        assert response.json()["title"] == "Water shutdown"

    def test_delegated_admin_can_create_notice(self, make_user, client_as):
        delegated_admin = make_user(role="Delegated Admin")
        response = client_as(delegated_admin).post("/api/notices/", json={
            "title": "Elevator maintenance",
            "description": "Elevator B will be out of service",
            "expiry_date": "2026-02-01",
        })
        assert response.status_code == 200

    def test_resident_cannot_list_all_notices(self, make_user, client_as):
        resident = make_user(role="Resident")
        response = client_as(resident).get("/api/notices/")
        assert response.status_code == 403
