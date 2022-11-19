export function getBasicTelegramOptions(message_id) {
  return {
    disable_notification: true,
    reply_to_message_id: message_id,
    parse_mode: 'html',
  };
}
