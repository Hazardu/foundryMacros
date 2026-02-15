const CONFIG_MACRO = {
  actorName: game.user.name,
  actionTitle: "RELOADINGGGG",
};

const resultHtml = function(username, weaponName, bulletsInMag) {
  const html = `
    <h5>RELOADINGGGGGG</h5>
    <p> ${username} przeładowuje <strong>${weaponName}</strong>. Ma ${bulletsInMag} naboje w magazynku</p>`;

  return html;
}

// ============== WYBIERANIE AKTORA ================= //

const user = game.actors.find(a => a.name === CONFIG_MACRO.actorName);

const dominantHand = user.system.handed;
const heldItemId = user.system.hands[dominantHand]?.id;
if(!heldItemId)
{
    return ui.notifications.error(`Załóż przedmiot do dominującej ręki - ${dominantHand}.`);
}

const item = user.items.get(heldItemId);
if(!item)
{
    return ui.notifications.error(`Nie znaleziono przedmiotu w ręce - ${dominantHand}.`);
}

if(item.system.hasAmmo())
{
   return ui.notifications.error(`Przedmiot nadal posiada amunicje w magazynku`);
}
item.system.mag.current = item.system.mag.value;

await ChatMessage.create({
  user: game.user.id,
  speaker: ChatMessage.getSpeaker({ actor: user }),
  content: resultHtml(user.name, item.name, item.system.mag.current)
});