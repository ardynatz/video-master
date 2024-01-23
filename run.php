<?php

include "function/func.php";
$token = getToken("configuration.ini");
include "function/telegram.php";
if($token == false){
    sM("[!] Failed to verify Telegram Bot Token..");
}else{
    sM("[+] Token : $token");
    define('BOT_TOKEN', $token);
    sM("[+] BOT Connected..");
    checkDir();
    start:
    $terbaru = file_get_contents('terbaru.txt');
    $update = json_decode(getMessage2($terbaru+1),true);
    if ($update['ok'] == true) {
        if(isset($update['result'][0]['update_id'])){
            $update_id = $update['result'][0]['update_id'];
            if($update_id > $terbaru){
                sM("[$update_id]=====================================================================");
                foreach($update['result'] as $pesan){
                    $message = $pesan['message']['text'];
                    $chatId = $pesan['message']['chat']['id'];
                    $messageId = $pesan['message']['message_id'];
                    $username = $pesan['message']['chat']['username'];
                    sM("[Message] From : $chatId ($username) -> $message");
                    $message = str_replace('  ',' ',$message);
				    $commandMatches = detectCommand($message);
                    if (!empty($commandMatches)) {
                        $commandName = $commandMatches[1];
                        $commandArguments = isset($commandMatches[3]) ? $commandMatches[3] : '';					
                        $isiPerintah = explode(' ',$commandArguments);
                        if($commandName == 'start' or $commandName == 'help'){
                            sM("[REPLY] To : $chatId -> (help)");
                            sendMessage($chatId, $messageId, helpMessage());	
                        }else
                        if($commandName == 'download'){
                            include "command/download.php";
                        }else
                        if($commandName == 'thumbnailsave'){
                            include "command/thumbnailsave.php";
                        }else
                        if($commandName == 'thumbnailsend'){
                            include "command/thumbnailsend.php";
                        }else
                        if($commandName == 'thumbnaillist'){
                            include "command/thumbnaillist.php";
                        }else
                        if($commandName == 'audiosave'){
                            include "command/audiosave.php";
                        }else
                        if($commandName == 'audioyt'){
                            include "command/audioyt.php";
                        }else
                        if($commandName == 'audiolist'){
                            include "command/audiolist.php";
                        }else
                        if($commandName == 'audiosend'){
                            include "command/audiosend.php";
                        }else{
                            $respon = "Command not found, try typing /help";
					        sM("[REPLY] To : $chatId -> $respon");
					        sendMessage($chatId, $messageId, $respon);
                        }
                    }else{
                        $respon = "Command not found, try typing /help";
					    sM("[REPLY] To : $chatId -> $respon");
					    sendMessage($chatId, $messageId, $respon);
                    }
                }
                file_put_contents('terbaru.txt',$update_id);
                goto start;
            }else{
                sM("[!]No New Message..");
                sleep(0.75);
                goto start;
            }
            sM("===============================================================================");
        }else{
            sleep(0.75);
            goto start;
        }
    }else{
        sM("[!] failed to update data..");
        goto start;
    }
}
?>