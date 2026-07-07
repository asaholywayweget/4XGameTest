# Agent Loop Runner

This folder contains a minimal local runner for the cyclic reasoning protocol.

It does not call external AI services by itself. Instead, it provides a deterministic packet structure that can be filled by a coordinator, reviewed, committed, and replayed.

## Goals

- Separate architecture reasoning from executable artifacts.
- Keep role-gap review before implementation.
- Make unattended progress auditable.
- Prevent direct accidental modification of core runtime files.

## Files

```txt
agent_loop_runner.py   # creates a loop packet skeleton
schema.json            # machine-checkable packet shape
sample_packet.json     # example output packet
```

## Run

```bash
python tools/agent_loop/agent_loop_runner.py --loop-id loop-0001 --out .agent_loop/loop-0001.json
```

## Safety

By default, the runner only writes packet files and does not modify `/src`, `/tests`, build files, or CI files.
