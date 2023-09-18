B1: Cài scoop (nếu chạy lệnh lỗi Installing scoop fails: "Running the installer as administrator is disabled by default,  thì chạy iex "& {$(irm get.scoop.sh)} -RunAsAdmin" )
B2: mở powershell run:  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
B3: scoop install supabase
B4: scoop update supabase
B5: mở terminal project run: supabase init. (Nếu gặp lỗi chưa login thì chạy supabase login )
B6: chạy lệnh supabase link --project-ref=mdtrwysggkfrsubhdiqy // tùy vào đoạnanj mã của database
B7: tạo 1 file migration mới : supabase migration new --tên-file-
B8: paste code của file .sql vào
B9: chạy supabase db push