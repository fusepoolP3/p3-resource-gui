
var turtleExamples = [];

turtleExamples[0] =	"@prefix dct: <http://purl.org/dc/terms/> . \n" +
					"@prefix ldp: <http://www.w3.org/ns/ldp#>. \n" +
					"\n" +
					"<> a ldp:BasicContainer ; \n" +
					"\t dct:title \"Container title\" .";
					
turtleExamples[1] = "@prefix dct: <http://purl.org/dc/terms/> . \n" +
					"@prefix ldp: <http://www.w3.org/ns/ldp#>. \n" + 
					"@prefix eldp: <http://vocab.fusepool.info/eldp#>. \n" + 
					"\n" +
					"<> a ldp:DirectContainer ; \n" +
					"\t dct:title \"My first transforming LDPC\" ; \n" +
					"\t eldp:transformer <http://localhost:7100/simple-transformer>. ";

turtleExamples[2] = "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \n" +
					"@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \n" +
					"@prefix foaf: <http://xmlns.com/foaf/0.1/> . \n" +
					"\n" +
					"<#JW> \n" +
					"\t a foaf:Person ; \n" +
					"\t foaf:name \"Jimmy Wales\" ; \n" +
					"\t foaf:mbox <mailto:jwales@bomis.com> ; \n" +
					"\t foaf:homepage <http://www.jimmywales.com/> ; \n" +
					"\t foaf:nick \"Jimbo\" ; \n" +
					"\t foaf:depiction <http://imavatar.org/img/placeholder/p-2.png> ; \n" +
					"\t foaf:interest <http://www.wikimedia.org> ; \n" +
					"\t foaf:knows [ \n" +
					"\t\t a foaf:Person ;\n" +
					"\t\t foaf:name \"Angela Beesley\" \n" +
					"\t ] .\n";

turtleExamples[3] = "@prefix hcalendar: <http://microformats.org/profile/hcalendar#> . \n" +
					"@prefix hcard: <http://microformats.org/profile/hcard#> . \n" +
					"@prefix md: <http://www.w3.org/ns/md#> . \n" +
					"@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \n" +
					"@prefix rdfa: <http://www.w3.org/ns/rdfa#> . \n" +
					"@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \n" +
					"@prefix schema: <http://schema.org/> . \n" +
					"@prefix xml: <http://www.w3.org/XML/1998/namespace> . \n" +
					"@prefix xsd: <http://www.w3.org/2001/XMLSchema#> . \n" +
					"\n" +
					"<> rdfa:usesVocabulary schema: . \n" +
					"\n" +
					"[] a schema:Restaurant ; \n" +
					"\t schema:address [ a schema:PostalAddress ; \n" +
					"\t\t\t schema:addressLocality \"Sunnyvale\" ; \n" +
					"\t\t\t schema:addressRegion \"CA\" ; \n" +
					"\t\t\t schema:postalCode \"94086\" ; \n" +
					"\t\t\t schema:streetAddress \"1901 Lemur Ave\" ] ; \n" +
					"\t schema:aggregateRating [ a schema:AggregateRating ; \n" +
					"\t\t\t schema:ratingValue \"4\" ; \n" +
					"\t\t\t schema:reviewCount \"250\" ] ; \n" +
					/*"\t schema:name \"GreatFood\" ; \n" +*/
					"\t schema:openingHours \"Fr-Sa 17:00-22:00\", \n" +
					"\t\t \"Mo-Sa 11:00-14:30\", \n" +
					"\t\t \"Mo-Th 17:00-21:30\" ; \n" +
					"\t schema:priceRange \"$$\" ; \n" +
					"\t schema:servesCuisine \"\"\" \n" +
					"\t\t Mediterranean \n" +
					"\t \"\"\",\"\"\" \n" +
					"\t\t Middle Eastern \n" +
					"\t \"\"\"; \n" +
					"\t schema:telephone \"(408) 714-1489\" ; \n" +
					"\t schema:url <http://www.dishdash.com> .";
					
