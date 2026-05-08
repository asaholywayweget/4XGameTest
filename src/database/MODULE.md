# Database Module

Ownership:
- schema contracts
- repositories
- snapshot storage
- replay storage
- rule and constants storage

Depends on:
- core contracts
- simulation data contracts

Rule:
Database implementation must be replaceable.

Initial contracts:
- Repository
- SnapshotStore
- ReplayStore
- RuleStore
- SchemaVersion
