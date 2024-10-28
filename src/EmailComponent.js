function handleButtonClick(data) {
    console.log(data);

    const email = data.slice(1).map((sublist) => (sublist.length > 0 ? sublist[3] : null));

    console.log(email);

    const emailString = email.join(", ");

    console.log(emailString);

    const subject = "VBHS Music Manager";

    const body = "Hello!";

    const mailto = `mailto:${emailString}?subject=${subject}&body=${body}`;

    window.location.href = mailto;

    return;
}

function EmailComponent({ data }) {
  return (
    <div>
      <h3>Send Email</h3>
      <button onClick={() => {handleButtonClick(data)}}>Send</button>
    </div>
  );
}

export default EmailComponent;
