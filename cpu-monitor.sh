#!/usr/bin/env bash
# cpu-monitor.sh - log the top CPU-consuming processes at a fixed interval,
# then summarize which processes used the most CPU over time.
#
# Usage:
#   ./cpu-monitor.sh start [interval_seconds]   # start logging in the background (default 60s)
#   ./cpu-monitor.sh stop                       # stop the background logger
#   ./cpu-monitor.sh report [N]                 # show top N processes by average CPU (default 10)
#   ./cpu-monitor.sh now                        # show the top processes right now
#
# Works on Linux and macOS. Log goes to ~/cpu-monitor/cpu.log

DIR="$HOME/cpu-monitor"
LOG="$DIR/cpu.log"
PIDFILE="$DIR/monitor.pid"
mkdir -p "$DIR"

snapshot() {
  # Prints: timestamp<TAB>pid<TAB>%cpu<TAB>command  (top 10 processes)
  local ts; ts=$(date '+%Y-%m-%d %H:%M:%S')
  ps -Ao pid=,pcpu=,comm= -r 2>/dev/null | head -n 10 | \
    awk -v ts="$ts" '{pid=$1; cpu=$2; $1=$2=""; sub(/^ +/,""); printf "%s\t%s\t%s\t%s\n", ts, pid, cpu, $0}' \
  || true
}

# Linux `ps` has no -r; fall back to --sort.
if ! ps -Ao pid= -r >/dev/null 2>&1; then
  snapshot() {
    local ts; ts=$(date '+%Y-%m-%d %H:%M:%S')
    ps -eo pid=,pcpu=,comm= --sort=-pcpu | head -n 10 | \
      awk -v ts="$ts" '{pid=$1; cpu=$2; $1=$2=""; sub(/^ +/,""); printf "%s\t%s\t%s\t%s\n", ts, pid, cpu, $0}'
  }
fi

case "${1:-}" in
  start)
    interval="${2:-60}"
    if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
      echo "Already running (PID $(cat "$PIDFILE")). Log: $LOG"; exit 0
    fi
    nohup bash -c "while true; do \"$0\" _snap >> \"$LOG\"; sleep $interval; done" >/dev/null 2>&1 &
    echo $! > "$PIDFILE"
    echo "Started (PID $!), sampling every ${interval}s. Log: $LOG"
    ;;
  _snap)
    snapshot
    ;;
  stop)
    if [ -f "$PIDFILE" ]; then kill "$(cat "$PIDFILE")" 2>/dev/null && echo "Stopped."; rm -f "$PIDFILE"
    else echo "Not running."; fi
    ;;
  now)
    snapshot | cut -f2-
    ;;
  report)
    n="${2:-10}"
    [ -s "$LOG" ] || { echo "No data yet in $LOG"; exit 1; }
    samples=$(cut -f1 "$LOG" | sort -u | wc -l | tr -d ' ')
    echo "Samples: $samples  ($(head -n1 "$LOG" | cut -f1)  ->  $(tail -n1 "$LOG" | cut -f1))"
    echo
    printf "%-30s %10s %10s %12s\n" "PROCESS" "AVG %CPU" "MAX %CPU" "SEEN IN TOP"
    awk -F'\t' -v s="$samples" '{sum[$4]+=$3; cnt[$4]++; if($3>max[$4]) max[$4]=$3}
      END {for (p in sum) printf "%.1f\t%-30s %10.1f %10.1f %11d%%\n", sum[p]/s, substr(p,1,30), sum[p]/s, max[p], cnt[p]*100/s}' "$LOG" \
      | sort -t$'\t' -k1,1 -nr | cut -f2- | head -n "$n"
    ;;
  *)
    sed -n '2,12p' "$0"; exit 1
    ;;
esac
