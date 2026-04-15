-- ============================================================
-- ASSET MANAGEMENT SYSTEM - Oracle Database Schema
-- ============================================================

-- Drop tables in reverse dependency order (if re-running)
BEGIN
  FOR t IN (SELECT table_name FROM user_tables
            WHERE table_name IN ('PROJECTIONS','TRANSACTIONS','SIPS','ASSETS','USERS')) LOOP
    EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
  END LOOP;
END;
/

BEGIN
  FOR s IN (SELECT sequence_name FROM user_sequences
            WHERE sequence_name IN ('SEQ_USER','SEQ_ASSET','SEQ_SIP','SEQ_TRANSACTION','SEQ_PROJECTION')) LOOP
    EXECUTE IMMEDIATE 'DROP SEQUENCE ' || s.sequence_name;
  END LOOP;
END;
/

-- ============================================================
-- SEQUENCES
-- ============================================================
CREATE SEQUENCE SEQ_USER        START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE SEQ_ASSET       START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE SEQ_SIP         START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE SEQ_TRANSACTION START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE SEQ_PROJECTION  START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

-- ============================================================
-- TABLE: USERS
-- ============================================================
CREATE TABLE USERS (
    user_id       NUMBER PRIMARY KEY,
    name          VARCHAR2(150)  NOT NULL,
    email         VARCHAR2(255)  NOT NULL UNIQUE,
    password      VARCHAR2(255)  NOT NULL,
    role          VARCHAR2(10)   DEFAULT 'USER' NOT NULL,
    is_verified   NUMBER(1)      DEFAULT 0 NOT NULL,
    created_at    TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at    TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT chk_user_role CHECK (role IN ('USER'))
);

-- ============================================================
-- TABLE: ASSETS
-- ============================================================
CREATE TABLE ASSETS (
    asset_id          NUMBER PRIMARY KEY,
    user_id           NUMBER        NOT NULL,
    asset_name        VARCHAR2(255) NOT NULL,
    asset_type        VARCHAR2(20)  NOT NULL,
    investment_amount NUMBER(12,2)  NOT NULL,
    current_value     NUMBER(12,2)  NOT NULL,
    purchase_date     DATE          NOT NULL,
    is_active         NUMBER(1)     DEFAULT 1 NOT NULL,
    created_at        TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_asset_user    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_asset_type   CHECK (asset_type IN ('MUTUAL_FUND','SIP','FIXED_DEPOSIT','SAVINGS','OTHER')),
    CONSTRAINT chk_asset_inv    CHECK (investment_amount > 0),
    CONSTRAINT chk_asset_val    CHECK (current_value >= 0),
    CONSTRAINT chk_asset_active CHECK (is_active IN (0,1))
);

-- ============================================================
-- TABLE: SIPS
-- ============================================================
CREATE TABLE SIPS (
    sip_id          NUMBER PRIMARY KEY,
    user_id         NUMBER        NOT NULL,
    fund_name       VARCHAR2(255) NOT NULL,
    monthly_amount  NUMBER(12,2)  NOT NULL,
    expected_return NUMBER(5,2)   NOT NULL,
    duration        NUMBER        NOT NULL,
    start_date      DATE          NOT NULL,
    status          VARCHAR2(15)  DEFAULT 'ACTIVE' NOT NULL,
    created_at      TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_sip_user      FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_sip_status   CHECK (status IN ('ACTIVE','PAUSED','COMPLETED')),
    CONSTRAINT chk_sip_amount   CHECK (monthly_amount > 0),
    CONSTRAINT chk_sip_return   CHECK (expected_return > 0),
    CONSTRAINT chk_sip_duration CHECK (duration > 0)
);

-- ============================================================
-- TABLE: TRANSACTIONS
-- ============================================================
CREATE TABLE TRANSACTIONS (
    transaction_id NUMBER PRIMARY KEY,
    user_id        NUMBER        NOT NULL,
    type           VARCHAR2(6)   NOT NULL,
    amount         NUMBER(12,2)  NOT NULL,
    category       VARCHAR2(100) NOT NULL,
    txn_date       DATE          NOT NULL,
    description    CLOB,
    created_at     TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_txn_user  FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_txn_type CHECK (type IN ('CREDIT','DEBIT')),
    CONSTRAINT chk_txn_amt  CHECK (amount > 0)
);

-- ============================================================
-- TABLE: PROJECTIONS
-- ============================================================
CREATE TABLE PROJECTIONS (
    projection_id   NUMBER PRIMARY KEY,
    user_id         NUMBER        NOT NULL,
    investment_type VARCHAR2(100) NOT NULL,
    monthly_amount  NUMBER(12,2)  NOT NULL,
    expected_return NUMBER(5,2)   NOT NULL,
    future_value    NUMBER(15,2)  NOT NULL,
    years           NUMBER        NOT NULL,
    calculated_date TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_proj_user CHECK (user_id > 0),
    CONSTRAINT fk_proj_user_fk FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_proj_amt CHECK (monthly_amount > 0),
    CONSTRAINT chk_proj_yr  CHECK (years > 0)
);

-- ============================================================
-- TRIGGERS (auto-populate PKs from sequences)
-- ============================================================
CREATE OR REPLACE TRIGGER trg_users_pk
  BEFORE INSERT ON USERS FOR EACH ROW
BEGIN
  IF :NEW.user_id IS NULL THEN
    SELECT SEQ_USER.NEXTVAL INTO :NEW.user_id FROM DUAL;
  END IF;
  :NEW.updated_at := SYSTIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_assets_pk
  BEFORE INSERT ON ASSETS FOR EACH ROW
BEGIN
  IF :NEW.asset_id IS NULL THEN
    SELECT SEQ_ASSET.NEXTVAL INTO :NEW.asset_id FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_sips_pk
  BEFORE INSERT ON SIPS FOR EACH ROW
BEGIN
  IF :NEW.sip_id IS NULL THEN
    SELECT SEQ_SIP.NEXTVAL INTO :NEW.sip_id FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_transactions_pk
  BEFORE INSERT ON TRANSACTIONS FOR EACH ROW
BEGIN
  IF :NEW.transaction_id IS NULL THEN
    SELECT SEQ_TRANSACTION.NEXTVAL INTO :NEW.transaction_id FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_projections_pk
  BEFORE INSERT ON PROJECTIONS FOR EACH ROW
BEGIN
  IF :NEW.projection_id IS NULL THEN
    SELECT SEQ_PROJECTION.NEXTVAL INTO :NEW.projection_id FROM DUAL;
  END IF;
END;
/

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_assets_user     ON ASSETS(user_id);
CREATE INDEX idx_sips_user       ON SIPS(user_id);
CREATE INDEX idx_txn_user_date   ON TRANSACTIONS(user_id, txn_date);
CREATE INDEX idx_proj_user       ON PROJECTIONS(user_id);

-- ============================================================
-- SAMPLE SEED DATA
-- ============================================================
INSERT INTO USERS (user_id, name, email, password, role, is_verified)
VALUES (SEQ_USER.NEXTVAL, 'Demo User', 'demo@ams.com',
        '$2a$12$exampleHashedPasswordForDemoUser1234567890AB', 'USER', 1);

COMMIT;
