#!/usr/bin/env bash
#
# Build Poranne TNT into a .wgt, install it on the TV and launch it.
# Needs: Tizen Studio in ~/tizen-studio, the 'tv' certificate profile,
# and Developer Mode on the TV (see ../tizen-web-app/README.md).
set -euo pipefail

TV_IP="${TV_IP:-}"   # adres IP telewizora, np. TV_IP=192.168.1.50 ./build-and-install.sh
SDB_PORT="${SDB_PORT:-26101}"
PROFILE="${TIZEN_PROFILE:-tv}"
APP_ID="CldTntMrn1.PoranneTNT"
HERE="$(cd "$(dirname "$0")" && pwd)"
TIZEN_HOME="${TIZEN_HOME:-$HOME/tizen-studio}"
export PATH="$TIZEN_HOME/tools/ide/bin:$TIZEN_HOME/tools:$PATH"
DEV="${TV_IP}:${SDB_PORT}"

command -v tizen >/dev/null || { echo "ERROR: 'tizen' CLI not found (install Tizen Studio)."; exit 1; }
command -v sdb   >/dev/null || { echo "ERROR: 'sdb' not found."; exit 1; }

[ -n "${TV_IP}" ] || { echo "ERROR: ustaw adres telewizora: TV_IP=192.168.x.y $0"; exit 1; }
echo "==> Connecting to TV ${DEV} ..."
sdb connect "${DEV}"
sdb devices

echo "==> Building + packaging (profile '${PROFILE}') ..."
cd "${HERE}"
rm -rf .buildResult
tizen build-web -e "tools/*" -e "*.sh" -e "*.md" -out .buildResult -- .
tizen package -t wgt -s "${PROFILE}" -- .buildResult

# The TV installer chokes on spaces in the file name ("Poranne TNT.wgt").
mv "$(ls -t "${HERE}/.buildResult"/*.wgt | head -1)" "${HERE}/.buildResult/PoranneTNT.wgt"
WGT="${HERE}/.buildResult/PoranneTNT.wgt"
echo "==> Built: ${WGT}"

echo "==> Installing on TV ..."
tizen install -s "${DEV}" -n "$(basename "${WGT}")" -- "${HERE}/.buildResult"

echo "==> Launching ..."
tizen run -s "${DEV}" -p "${APP_ID}"
