Deployments found at https://central.sonatype.com/publishing/deployments

## Example maven commands

Run all tests:
```
mvn test
```

Deploy
```
mvn -s ./settings.xml clean deploy -Dgpg.passphrase=yourpassphrase
```

## PGP Key Management

Generate PGP key:
```
gpg --gen-key
> Real name: IBM Accessibility
> Email address: eatools@us.ibm.com
gpg --armor --output public-key.gpg --export eatools@us.ibm.com
```
Go to https://keyserver.ubuntu.com/, Click `Submit Key`, and paste in public-key.gpg

Export private key:
```
gpg --export-secret-keys -a 7A58C8C58C35FF078630FA3615954E19FBC774C4
```

Verify Key:
```
gpg --list-signatures
```
Go to https://keyserver.ubuntu.com/pks/lookup?search=7A58C8C58C35FF078630FA3615954E19FBC774C4&fingerprint=on&op=index and replace `7A58C8C58C35FF078630FA3615954E19FBC774C4` with the key signature