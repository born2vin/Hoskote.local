import pytest

from app.schemas import ContactStatusUpdate


class TestContactStatusUpdateValidation:
    def test_rejects_invalid_status(self):
        with pytest.raises(ValueError, match="approval_status must be one of"):
            ContactStatusUpdate(approval_status="maybe")

    @pytest.mark.parametrize("status", ["pending", "approved", "rejected"])
    def test_accepts_known_statuses(self, status):
        assert ContactStatusUpdate(approval_status=status).approval_status == status


class TestContactSubmissionAndApprovalFlow:
    def test_submission_defaults_to_pending_regardless_of_role(self, make_user, client_as):
        resident = make_user(role="Resident")
        response = client_as(resident).post("/api/contacts/", json={
            "name": "Ramesh Plumbing",
            "phone": "9876543210",
            "category": "Plumber",
        })
        assert response.status_code == 200
        assert response.json()["approval_status"] == "pending"

    def test_public_directory_only_returns_approved_contacts(self, db_session, make_user, client_as):
        from app.models import Contact
        resident = make_user(role="Resident")
        db_session.add_all([
            Contact(name="Pending Electrician", phone="111", category="Electrician",
                    approval_status="pending", submitted_by_id=resident.id),
            Contact(name="Approved Plumber", phone="222", category="Plumber",
                    approval_status="approved", submitted_by_id=resident.id),
            Contact(name="Rejected Guy", phone="333", category="Other",
                    approval_status="rejected", submitted_by_id=resident.id),
        ])
        db_session.commit()

        response = client_as(resident).get("/api/contacts/")

        assert response.status_code == 200
        names = [c["name"] for c in response.json()]
        assert names == ["Approved Plumber"]

    def test_resident_cannot_view_pending_queue(self, make_user, client_as):
        resident = make_user(role="Resident")
        response = client_as(resident).get("/api/contacts/pending")
        assert response.status_code == 403

    def test_resident_cannot_approve_contact(self, db_session, make_user, client_as):
        from app.models import Contact
        resident = make_user(role="Resident")
        contact = Contact(name="Municipal Office", phone="444", category="Municipal",
                           approval_status="pending", submitted_by_id=resident.id)
        db_session.add(contact)
        db_session.commit()
        db_session.refresh(contact)

        response = client_as(resident).patch(
            f"/api/contacts/{contact.id}/status", json={"approval_status": "approved"}
        )
        assert response.status_code == 403

    def test_admin_can_approve_pending_contact(self, db_session, make_user, client_as):
        from app.models import Contact
        resident = make_user(role="Resident")
        admin = make_user(role="Admin")
        contact = Contact(name="Municipal Office", phone="444", category="Municipal",
                           approval_status="pending", submitted_by_id=resident.id)
        db_session.add(contact)
        db_session.commit()
        db_session.refresh(contact)

        response = client_as(admin).patch(
            f"/api/contacts/{contact.id}/status", json={"approval_status": "approved"}
        )

        assert response.status_code == 200
        body = response.json()
        assert body["approval_status"] == "approved"
        assert body["reviewed_at"] is not None

        # Newly approved contact now shows up in the public directory.
        directory = client_as(resident).get("/api/contacts/")
        assert any(c["id"] == contact.id for c in directory.json())

    def test_admin_can_reject_pending_contact(self, db_session, make_user, client_as):
        from app.models import Contact
        resident = make_user(role="Resident")
        admin = make_user(role="Admin")
        contact = Contact(name="Suspicious Guy", phone="555", category="Other",
                           approval_status="pending", submitted_by_id=resident.id)
        db_session.add(contact)
        db_session.commit()
        db_session.refresh(contact)

        response = client_as(admin).patch(
            f"/api/contacts/{contact.id}/status", json={"approval_status": "rejected"}
        )

        assert response.status_code == 200
        assert response.json()["approval_status"] == "rejected"

        directory = client_as(resident).get("/api/contacts/")
        assert all(c["id"] != contact.id for c in directory.json())
