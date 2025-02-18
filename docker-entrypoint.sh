#!/bin/bash 

function do_exit() {
  echo "Exiting ..."
  echo "Done."
}

trap do_exit SIGTERM SIGINT SIGHUP

npm run preview &

echo "admin dashboard started."

sleep infinity &
wait $!
