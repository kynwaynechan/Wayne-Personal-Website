function updateLocationOptions() {
  const modality = document.getElementById('event_modality').value;
  const locationContainer = document.getElementById('location_container');
  const remoteUrlContainer = document.getElementById('remote_url_container');
  const locationInput = document.getElementById('event_location');
  const remoteUrlInput = document.getElementById('event_remote_url');

  if (modality === 'in-person') {
    locationContainer.style.display = 'block';
    remoteUrlContainer.style.display = 'none';
    locationInput.required = true;
    remoteUrlInput.required = false;
  } else {
    locationContainer.style.display = 'none';
    remoteUrlContainer.style.display = 'block';
    locationInput.required = false;
    remoteUrlInput.required = true;
  }
}

document.getElementById('event_modal').addEventListener('shown.bs.modal', function () {
  updateLocationOptions();
});

const events = [];
let editingEventId = null;

function saveEvent() {
  const form = document.getElementById('event_form');

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const modality = document.getElementById('event_modality').value;

  const eventDetails = {
    id: editingEventId || Date.now(),
    name: document.getElementById('event_name').value,
    weekday: document.getElementById('event_weekday').value,
    time: document.getElementById('event_time').value,
    modality: modality,
    location: modality === 'in-person' ? document.getElementById('event_location').value : null,
    remote_url: modality === 'remote' ? document.getElementById('event_remote_url').value : null,
    attendees: document.getElementById('event_attendees').value,
    category: document.getElementById('event_category').value,
  };

  if (editingEventId) {
    const index = events.findIndex(e => e.id === editingEventId);
    events[index] = eventDetails;

    const oldCard = document.querySelector(`[data-event-id="${editingEventId}"]`);
    if (oldCard) oldCard.remove();

    addEventToCalendarUI(eventDetails);
    editingEventId = null;
  } else {
    events.push(eventDetails);
    addEventToCalendarUI(eventDetails);
  }

  console.log(events);

  form.reset();
  updateLocationOptions();

  const modalElement = document.getElementById('event_modal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.hide();
}

function editEvent(eventId) {
  const eventToEdit = events.find(e => e.id === eventId);
  if (!eventToEdit) return;

  editingEventId = eventId;

  document.getElementById('event_name').value = eventToEdit.name;
  document.getElementById('event_weekday').value = eventToEdit.weekday;
  document.getElementById('event_time').value = eventToEdit.time;
  document.getElementById('event_modality').value = eventToEdit.modality;
  document.getElementById('event_attendees').value = eventToEdit.attendees;
  document.getElementById('event_category').value = eventToEdit.category;

  if (eventToEdit.modality === 'in-person') {
    document.getElementById('event_location').value = eventToEdit.location;
    document.getElementById('event_remote_url').value = '';
  } else {
    document.getElementById('event_remote_url').value = eventToEdit.remote_url;
    document.getElementById('event_location').value = '';
  }

  updateLocationOptions();

  const modalElement = document.getElementById('event_modal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.show();
}

function createEventCard(eventDetails) {
  const eventElement = document.createElement('div');
  eventElement.className = 'event row border rounded m-1 py-1';
  eventElement.setAttribute('data-event-id', eventDetails.id);
  eventElement.style.cursor = 'pointer';
  eventElement.addEventListener('click', () => editEvent(eventDetails.id));

  const categoryColors = {
    academic: 'bg-primary text-white',
    work: 'bg-secondary text-white',
    personal: 'bg-danger text-white',
    social: 'bg-warning text-dark',
  };

  eventElement.className += ' ' + categoryColors[eventDetails.category];

  const detailsElement = document.createElement('div');
  detailsElement.className = 'col';

  const locationLine = eventDetails.modality === 'in-person'
    ? `Location: ${eventDetails.location}`
    : `Remote: ${eventDetails.remote_url}`;

  detailsElement.innerHTML = `
    <strong>${eventDetails.name}</strong><br>
    ${eventDetails.time}<br>
    ${locationLine}<br>
    Attendees: ${eventDetails.attendees}
  `;

  eventElement.appendChild(detailsElement);
  return eventElement;
}

function addEventToCalendarUI(eventInfo) {
  const card = createEventCard(eventInfo);
  const dayColumn = document.getElementById(eventInfo.weekday);
  dayColumn.appendChild(card);
}