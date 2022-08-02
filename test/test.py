from dotenv import load_dotenv
import requests
import os

# note: account check needs a separate app, can not have continuous access

account = False # Demo bank 
user = False
webhook = False
payment = True # Demo bank

# payment parameters
market = 'FR' # default SE, recipients location
currency = 'EUR' # recipient and payers currency needs to match
amount = 10000 # > 150 to prevent paying from receiving account


def load_tinkenv():
    load_dotenv()
    _env = [
        'TINK_CLIENT_ID',
        'TINK_CLIENT_SECRET', 
        'ACTOR_CLIENT_ID',
        'USER_ID',
        'CREDENTIALS_ID',
        'ACCOUNT_VERIFICATION_REPORT_ID',
        'ORACLEPAY_CLIENT_ID',
        'ORACLEPAY_CLIENT_SECRET'
        ]
    return {e: empty_to_none(e) for e in _env}


def empty_to_none(field):
    value = os.getenv(field)
    if value is None or len(value) == 0:
        return None
    return value


def json_parse(json_object, path):
    """Basic parser, assumes path is reachable in json_object"""
    for item in path:
        json_object = json_object[item]
    return json_object


def construct_url(
    url='https://api.tink.com/api/v1/oauth/token', 
    ending='token', 
    **kwargs
    ):
    """Used for generating user interactive Tink Link URL"""
    if url.endswith(ending) and kwargs:
        url += '?'
        for key, value in kwargs.items():
            url += f'{key}={value}&'
    return url.rstrip('&')


def initiate_tink(
    client_id, 
    service='account-check', 
    callback='https://console.tink.com/callback', 
    market='SE', 
    **kwargs
    ):
    """Returns url to end user for authentication"""
    base_url = f'https://link.tink.com/1.0/{service}'
    data = {
        "client_id": client_id,
        "redirect_uri": callback, # callback only works with reachable internet pages, not locally
        "market": market,
        "locale": 'en_US'
    }
    misc = {key: value for key, value in kwargs.items()}
    data = {**data, **misc} if misc else data

    return construct_url(base_url, ending=service, **data)
    

def create_bearer_token(base_url, **kwargs):
    url = base_url + 'oauth/token'
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    }
    data = {key: value for key, value in kwargs.items()}
    r = requests.post(url, headers=headers, data=data)
    assert str(r.status_code).startswith('2'), r.text
    return r.json()["access_token"]


def account_verification(client_id, client_secret, report_id): # changed topup to Demo bank as well
    base_url = 'https://api.tink.com/api/v1/'
    grant_type = 'client_credentials'
    scope = 'account-verification-reports:read'

    bearer_token = create_bearer_token(
        base_url,
        client_id=client_id,
        client_secret=client_secret,
        grant_type=grant_type,
        scope=scope
    )

    url = base_url + 'account-verification-reports/' + report_id
    headers = {
        'Authorization': 'Bearer ' + bearer_token
    }

    r = requests.get(url, headers=headers)
    return r.json()


def create_user(client_id, client_secret):
    base_url = 'https://api.tink.com/api/v1/'
    grant_type = 'client_credentials'
    scope = 'user:create'

    bearer_token = create_bearer_token(
        base_url,
        client_id=client_id,
        client_secret=client_secret,
        grant_type=grant_type,
        scope=scope
    )

    print(bearer_token)


def webhook_creation(client_id, client_secret, webhook_url):
    base_url = 'https://api.tink.com/api/v1/'
    grant_type = 'client_credentials'
    scope = 'webhook-endpoints'

    bearer_token = create_bearer_token(
        base_url,
        client_id=client_id,
        client_secret=client_secret,
        grant_type=grant_type,
        scope=scope
    )

    url = 'https://api.tink.com/events/v2/' + scope
    headers = {
        'Authorization': 'Bearer ' + bearer_token,
        'Content-Type': 'application/json'
    }
    data = {
        "description": "OraclePayment webhook",
        "disabled": False,
        "enabledEvents": ["payment:updated"],
        "url": webhook_url
    }
    r = requests.post(url, headers=headers, json=data)
    return r.json()
    

def payment_initiation(
    client_id, 
    client_secret,
    market='SE',
    currency='SEK',
    amount=10000
    ):
    base_url = 'https://api.tink.com/api/v1/'
    grant_type = 'client_credentials'
    scope = 'payment:write'
    # NOTE: Requires the same currency between buyer/seller

    recipients = { # mapping market:currency:account, always use smallest account possible
        "AT": {"EUR": 'AT850445855689970069'},
        "EE": {"EUR": 'EE468233973006396045'},
        "FI": {"EUR": 'FI5692728476249545', "SEK": 'FI8235510716321438'}, # can only receive or sell
        "FR": {"EUR": 'FR700899686173HRBWBEI35BP08'},
        "DE": {"EUR": 'DE73567139321459454946'},
        "IT": {"EUR": 'IT57R00537526833B2OTMXU3XSF'},
        "NL": {"SEK": 'NL49OWYA2135730343'},
        "NO": {"NOK": 'NO7292418639953'},
        "PT": {"EUR": 'PT57099843891892236827523'},
        "ES": {"EUR": 'ES2046606709420564020418'},
        "SE": {"SEK": 'SE2023668362587681437762'},
        "UK": {"GBP": 'GB76CHNI72617379714327'}
    }

    senders = { # just for info for front end later, only currency matching matters
        "AT": {"EUR": 'AT237779048615835002'},
        "EE": {"EUR": 'EE726382189649078964'},
        "FR": {"EUR": 'FR8544839534260SUPLSJCP1878'},
        "DE": {"EUR": 'DE86622025011873401330'},
        "IT": {"EUR": 'IT39P0266750520LJC1V5JDSPGJ'},
        "NL": {"EUR": 'NL24DGXA1322823873', "SEK": 'NL87CAHJ4325247115'}, # three accounts
        "NO": {"NOK": 'NO2576504492357'},
        "PT": {"EUR": 'PT63465472006596504782081'},
        "ES": {"EUR": 'ES4320339641318952396609'},
        "SE": {"SEK": 'SE2885222529285409533697'},
        "UK": {"GBP": 'GB27WRDK15987166981285'}
    }

    bearer_token = create_bearer_token(
        base_url,
        client_id=client_id,
        client_secret=client_secret,
        grant_type=grant_type,
        scope=scope
    )

    url = base_url + 'payments/requests'
    headers = {
        'Authorization': 'Bearer ' + bearer_token,
        'Content-Type': 'application/json'
    }
    data = {
        "destinations": [
           {
              "accountNumber": recipients[market][currency],
              "type": "iban"          
           }
        ],
        "amount": amount,
        "currency": currency,
        "market": market,
        "recipientName": "0xaCDd...1c48F1",
        "sourceMessage": "OraclePay escrow payment",
        "remittanceInformation": {
            "type": "UNSTRUCTURED",
            "value": "CREDITOR REFERENCE"
          },
        "paymentScheme": "SEPA_INSTANT_CREDIT_TRANSFER", # <-- key: limits up to 100k€
        "sourceMessage": "OraclePay test"
    }

    r = requests.post(url, headers=headers, json=data)
    return r.json()


def payment_status(client_id, client_secret, payment_id):
    base_url = 'https://api.tink.com/api/v1/'
    grant_type = 'client_credentials'
    scope = 'payment:read'

    bearer_token = create_bearer_token(
        base_url,
        client_id=client_id,
        client_secret=client_secret,
        grant_type=grant_type,
        scope=scope
    )

    url = base_url + 'payments/requests/' + payment_id + '/transfers'
    headers = {
        'Authorization': 'Bearer ' + bearer_token,
        'Content-Type': 'application/json'
    }
    r = requests.get(url, headers=headers)
    return r.json()


env_vars = load_tinkenv()

if account:
    TINK_CLIENT_ID = env_vars["TINK_CLIENT_ID"]
    TINK_CLIENT_SECRET = env_vars["TINK_CLIENT_SECRET"]
    # logical flow, user authenticates and creates a account check report
    print(initiate_tink(TINK_CLIENT_ID, service='account-check', callback='http://localhost:3000/callback', test='true'))
    # make sure app.py is running on localhost:3000 to write to .env
    input('Press <ENTER> to continue') 
    ACCOUNT_VERIFICATION_REPORT_ID = load_tinkenv()["ACCOUNT_VERIFICATION_REPORT_ID"]

    response = account_verification(TINK_CLIENT_ID, TINK_CLIENT_SECRET, ACCOUNT_VERIFICATION_REPORT_ID)
    print(response)


if user: # needs continuous access enabled, requested and awaiting toggle
    TINK_CLIENT_ID = env_vars["ORACLEPAY_CLIENT_ID"]
    TINK_CLIENT_SECRET = env_vars["ORACLEPAY_CLIENT_SECRET"]
    create_user(TINK_CLIENT_ID, TINK_CLIENT_SECRET)


if webhook:
    TINK_CLIENT_ID = env_vars["ORACLEPAY_CLIENT_ID"]
    TINK_CLIENT_SECRET = env_vars["ORACLEPAY_CLIENT_SECRET"]
    r = webhook_creation(TINK_CLIENT_ID, TINK_CLIENT_SECRET, 'http://localhost:3000/webhook') # this url doesn't work
    print(r)


if payment:
    TINK_CLIENT_ID = env_vars["ORACLEPAY_CLIENT_ID"]
    TINK_CLIENT_SECRET = env_vars["ORACLEPAY_CLIENT_SECRET"]
    json_response = payment_initiation(TINK_CLIENT_ID, TINK_CLIENT_SECRET, market=market, currency=currency, amount=amount)
    print(json_response)

    tink_link = initiate_tink(
        TINK_CLIENT_ID, 
        service='pay', 
        input_provider=f'{market.lower()}-demobank-open-banking-redirect', # not verified to work for all markets
        payment_request_id=json_response["id"],
        market=market,
    )
    # Tink Demo Bank > Open Banking > Demo Bank Authenticator App > Redirect
    # Important - select account other than recipient!
    print(tink_link)

    # Either integrate webhooks to chainlink bridge which trigger webhook job (important to verify webhook secret)
    while True: # or keeper polls this endpoint until status=sent
        input('Press <ENTER> to check payment status')
        payment_response = payment_status(TINK_CLIENT_ID, TINK_CLIENT_SECRET, json_response["id"])
        print(payment_response)